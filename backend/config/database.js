const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use /tmp directory for Vercel serverless environment
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
const dbPath = isVercel ? '/tmp/oceanwatch.db' : (process.env.DB_PATH || './database/oceanwatch.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists (only needed for local development)
if (!isVercel && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('📊 Connected to SQLite database');
  }
});

// Track if database has been initialized
let isInitialized = false;

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    // Skip if already initialized
    if (isInitialized) {
      return resolve();
    }

    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          trust_rating INTEGER DEFAULT 50,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Reports table
      db.run(`
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          image_url TEXT,
          image_data TEXT,
          latitude REAL,
          longitude REAL,
          accuracy REAL,
          address TEXT,
          description TEXT,
          visual_tag TEXT,
          alert_level TEXT DEFAULT 'medium',
          trust_score INTEGER DEFAULT 50,
          status TEXT DEFAULT 'pending',
          likes INTEGER DEFAULT 0,
          comments INTEGER DEFAULT 0,
          shares INTEGER DEFAULT 0,
          agents_analysis TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Comments table
      db.run(`
        CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          report_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (report_id) REFERENCES reports (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Likes table
      db.run(`
        CREATE TABLE IF NOT EXISTS likes (
          id TEXT PRIMARY KEY,
          report_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(report_id, user_id),
          FOREIGN KEY (report_id) REFERENCES reports (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Social posts table (for community feed)
      db.run(`
        CREATE TABLE IF NOT EXISTS social_posts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          content TEXT NOT NULL,
          image_url TEXT,
          likes INTEGER DEFAULT 0,
          comments INTEGER DEFAULT 0,
          shares INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database tables initialized');
          isInitialized = true;
          resolve();
        }
      });
    });
  });
};

// Ensure database is initialized before operations
const ensureInitialized = async () => {
  if (!isInitialized) {
    await initializeDatabase();
  }
};

module.exports = {
  db,
  initializeDatabase,
  ensureInitialized
};