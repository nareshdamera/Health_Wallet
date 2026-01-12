const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./health_wallet.db');

db.serialize(() => {
  // 1. Users Table - Added 'role' column
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('patient', 'viewer')) DEFAULT 'patient'
  )`);

  // 2. Reports Table
  db.run(`CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    file_url TEXT,
    report_type TEXT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // 3. Vitals Table
  db.run(`CREATE TABLE IF NOT EXISTS vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER,
    user_id INTEGER,
    vital_name TEXT,
    vital_value TEXT,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(report_id) REFERENCES reports(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // 4. Permissions Table - REQUIRED for the sharing feature
  // This allows "Others" to view specific reports granted by the Patient
  db.run(`CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER,
    shared_with_user_id TEXT, -- Can be an email or User ID
    access_level TEXT DEFAULT 'read-only',
    shared_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(report_id) REFERENCES reports(id)
  )`);
});

console.log("Database initialized with Patient/Viewer roles and Permissions table.");

module.exports = db;