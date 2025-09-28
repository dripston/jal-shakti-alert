const express = require('express');
const { db } = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// GET /api/users - Get all users (admin only)
router.get('/', authenticateToken, (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { limit = 50, offset = 0, search } = req.query;
  
  let query = `
    SELECT id, username, email, role, trust_rating, created_at, updated_at
    FROM users
    WHERE 1=1
  `;
  
  const params = [];

  if (search) {
    query += ' AND (username LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.json({
      users: rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: rows.length
      }
    });
  });
});

// GET /api/users/:id - Get specific user
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Users can only view their own profile unless they're admin
  if (req.user.userId !== id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.get(
    'SELECT id, username, email, role, trust_rating, created_at, updated_at FROM users WHERE id = ?',
    [id],
    (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    }
  );
});

// PUT /api/users/:id - Update user
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { username, email, role, trust_rating } = req.body;

  // Users can only update their own profile unless they're admin
  if (req.user.userId !== id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const updates = [];
  const params = [];

  if (username) {
    updates.push('username = ?');
    params.push(username);
  }

  if (email) {
    updates.push('email = ?');
    params.push(email);
  }

  // Only admins can update role and trust_rating
  if (req.user.role === 'admin') {
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }

    if (trust_rating !== undefined) {
      updates.push('trust_rating = ?');
      params.push(parseInt(trust_rating));
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

  db.run(query, params, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update user' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  });
});

// GET /api/users/:id/reports - Get user's reports
router.get('/:id/reports', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  // Users can only view their own reports unless they're admin
  if (req.user.userId !== id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const query = `
    SELECT r.*, u.username
    FROM reports r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.all(query, [id, parseInt(limit), parseInt(offset)], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch user reports' });
    }

    res.json({
      reports: rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: rows.length
      }
    });
  });
});

// GET /api/users/:id/stats - Get user statistics
router.get('/:id/stats', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Users can only view their own stats unless they're admin
  if (req.user.userId !== id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Get user stats in parallel
  const queries = {
    totalReports: 'SELECT COUNT(*) as count FROM reports WHERE user_id = ?',
    totalLikes: 'SELECT SUM(likes) as total FROM reports WHERE user_id = ?',
    totalComments: 'SELECT SUM(comments) as total FROM reports WHERE user_id = ?',
    verifiedReports: 'SELECT COUNT(*) as count FROM reports WHERE user_id = ? AND status = "verified"',
    avgTrustScore: 'SELECT AVG(trust_score) as avg FROM reports WHERE user_id = ?'
  };

  const stats = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, [id], (err, row) => {
      if (err) {
        console.error(`Database error for ${key}:`, err);
        stats[key] = 0;
      } else {
        stats[key] = row.count || row.total || row.avg || 0;
      }

      completedQueries++;
      if (completedQueries === totalQueries) {
        res.json({ stats });
      }
    });
  });
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Only admins can delete users
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  // Don't allow deleting yourself
  if (req.user.userId === id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  });
});

module.exports = router;