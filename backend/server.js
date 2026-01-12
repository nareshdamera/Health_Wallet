const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');
const db = require('./database');
const path = require('path'); // Added for path handling

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = "this_is_very_secret"; // Use a strong secret

const app = express();
app.use(cors());
app.use(express.json());

// --- ADDED STATIC MIDDLEWARE ---
// This allows the frontend to access files via http://localhost:5000/uploads/filename
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const upload = multer({ dest: 'uploads/' });

const extractVitals = (text) => {
  const vitals = [];
  const patterns = [
    { name: 'Blood Pressure', regex: /(?:Blood pressure|BP)[\s:=]+(\d{2,3})\/(\d{2,3})/i },
    { name: 'Sugar', regex: /Sugar[\s:=]+(\d+)/i },
    { name: 'Heart Rate', regex: /Heart\s*Rate[\s:=]+(\d+)/i }
  ];

  patterns.forEach(p => {
    const match = text.match(p.regex);
    if (match) {
      if (p.name === 'Blood Pressure') {
        vitals.push({ name: 'Systolic', value: match[1] });
        vitals.push({ name: 'Diastolic', value: match[2] });
      } else {
        vitals.push({ name: p.name, value: match[1] });
      }
    }
  });
  
  console.log("Extracted Vitals array:", vitals);
  return vitals;
};


// 1. Registration Route
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body; // Added name here
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, 
    [name, email, hashedPassword, role], (err) => {
      if (err) return res.status(500).json({ error: "User already exists" });
      res.json({ message: "User registered successfully!" });
    });
});

// 2. Login Route

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    
    // Return the name so the frontend can store it
    res.json({ 
        token, 
        role: user.role, 
        userId: user.id, 
        name: user.name 
    });
  });
});



app.post('/api/upload', upload.single('report'), async (req, res) => {
  const { userId } = req.body;
  
  // Ensure we store a consistent path format (uploads/filename)
  const filePath = req.file.path.replace(/\\/g, "/"); 

  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    const vitals = extractVitals(text);

    db.run(`INSERT INTO reports (user_id, file_url, report_type) VALUES (?, ?, ?)`, 
    [userId, filePath, 'General'], function(err) {
      if (err) return res.status(500).json(err);
      
      const reportId = this.lastID;
      vitals.forEach(v => {
        db.run(`INSERT INTO vitals (report_id, user_id, vital_name, vital_value) VALUES (?, ?, ?, ?)`,
        [reportId, userId, v.name, v.value]);
      });

      res.json({ message: "Report processed", vitals });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vitals/:userId', (req, res) => {
  db.all(`SELECT * FROM vitals WHERE user_id = ? ORDER BY recorded_at DESC`, [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.get('/api/reports/:userId', (req, res) => {
  db.all(`SELECT * FROM reports WHERE user_id = ? ORDER BY upload_date DESC`, [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.post('/api/share', (req, res) => {
  const { reportId, sharedWith } = req.body;
  db.run(`INSERT INTO permissions (report_id, shared_with_user_id, access_level) VALUES (?, ?, ?)`, 
  [reportId, sharedWith, 'read-only'], (err) => {
    if (err) return res.status(500).json({ error: "Already shared or invalid user" });
    res.json({ message: `Report shared with ${sharedWith}` });
  });
});

// backend/server.js

app.delete('/api/reports/:id', (req, res) => {
  const reportId = req.params.id;

  // Requirement: Allow patients to manage (delete) their reports
  db.run(`DELETE FROM reports WHERE id = ?`, [reportId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Also delete associated vitals to keep the database clean
    db.run(`DELETE FROM vitals WHERE report_id = ?`, [reportId]);
    
    res.json({ message: "Report and associated vitals deleted successfully" });
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
