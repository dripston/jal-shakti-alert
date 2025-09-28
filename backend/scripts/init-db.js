const { db, initializeDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function initializeApp() {
  try {
    console.log('🔄 Initializing database...');
    
    // Initialize database tables
    await initializeDatabase();
    
    // Create default admin user
    const adminId = uuidv4();
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    db.run(
      `INSERT OR IGNORE INTO users (id, username, email, password_hash, role, trust_rating) 
       VALUES (?, 'admin', 'admin@jalshakti.gov.in', ?, 'admin', 100)`,
      [adminId, adminPassword],
      function(err) {
        if (err) {
          console.error('❌ Failed to create admin user:', err);
        } else if (this.changes > 0) {
          console.log('✅ Admin user created successfully');
          console.log('   Username: admin');
          console.log('   Password: admin123');
          console.log('   ⚠️  Please change the default password!');
        } else {
          console.log('ℹ️  Admin user already exists');
        }
      }
    );

    // Create sample test user
    const testUserId = uuidv4();
    const testPassword = await bcrypt.hash('test123', 10);
    
    db.run(
      `INSERT OR IGNORE INTO users (id, username, email, password_hash, role, trust_rating) 
       VALUES (?, 'testuser', 'test@example.com', ?, 'user', 75)`,
      [testUserId, testPassword],
      function(err) {
        if (err) {
          console.error('❌ Failed to create test user:', err);
        } else if (this.changes > 0) {
          console.log('✅ Test user created successfully');
          console.log('   Username: testuser');
          console.log('   Password: test123');
        }
      }
    );

    console.log('🎉 Database initialization completed!');
    console.log('📊 You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeApp();