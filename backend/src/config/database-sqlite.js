const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('./logger');

class DatabaseService {
  constructor() {
    this.db = null;
  }

  async initialize() {
    try {
      const dbPath = path.join(__dirname, '../../data/policy_management.db');
      
      // Ensure data directory exists
      const fs = require('fs');
      const dataDir = path.dirname(dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          throw err;
        }
        logger.info('Connected to SQLite database');
      });

      // Create tables
      await this.createTables();
      await this.insertSampleData();
      
      return true;
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  async createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'author',
        department TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS policies (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        content TEXT NOT NULL,
        effective_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        risk_level TEXT NOT NULL DEFAULT 'Low',
        requires_legal_review INTEGER DEFAULT 0,
        requires_compliance_review INTEGER DEFAULT 0,
        stakeholders TEXT, -- JSON string
        tags TEXT, -- JSON string
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        version INTEGER NOT NULL DEFAULT 1,
        content_word_count INTEGER DEFAULT 0,
        process_instance_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        published_at DATETIME,
        archived_at DATETIME,
        FOREIGN KEY (author_id) REFERENCES users(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        policy_id TEXT,
        action TEXT NOT NULL,
        user_id TEXT,
        user_name TEXT,
        details TEXT, -- JSON string
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (policy_id) REFERENCES policies(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS policy_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        policy_id TEXT NOT NULL,
        reviewer_id TEXT NOT NULL,
        reviewer_name TEXT NOT NULL,
        reviewer_type TEXT,
        decision TEXT NOT NULL,
        comments TEXT,
        priority TEXT DEFAULT 'Medium',
        task_id TEXT,
        reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (policy_id) REFERENCES policies(id),
        FOREIGN KEY (reviewer_id) REFERENCES users(id)
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }
    
    logger.info('Database tables created successfully');
  }

  async insertSampleData() {
    // Check if users already exist
    const userCount = await this.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count > 0) {
      return; // Sample data already exists
    }

    const sampleUsers = [
      ['admin', 'admin', 'admin@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', 'admin', 'IT'],
      ['user123', 'testuser', 'user@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test', 'User', 'author', 'HR'],
      ['legal-team', 'legalreviewer', 'legal@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Legal', 'Reviewer', 'legal-team', 'Legal'],
      ['compliance-team', 'compliancereviewer', 'compliance@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Compliance', 'Reviewer', 'compliance-team', 'Compliance'],
      ['department-manager', 'deptmanager', 'manager@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Department', 'Manager', 'department-manager', 'Operations'],
      ['senior-manager', 'seniormanager', 'senior@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Senior', 'Manager', 'senior-manager', 'Executive']
    ];

    for (const user of sampleUsers) {
      await this.run(
        `INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, department) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        user
      );
    }

    logger.info('Sample data inserted successfully');
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async transaction(callback) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        try {
          const result = callback(this);
          this.db.run('COMMIT');
          resolve(result);
        } catch (error) {
          this.db.run('ROLLBACK');
          reject(error);
        }
      });
    });
  }

  async close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          logger.error('Error closing database:', err);
        } else {
          logger.info('Database connection closed');
        }
      });
    }
  }
}

module.exports = new DatabaseService();
