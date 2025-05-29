const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const { saveOTP, getOTP, clearOTP } = require('../otpStore');
const router = express.Router();

// Utility: generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register a new user
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if user already exists
  const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkUserQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Insert new user
    const insertUserQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(insertUserQuery, [name, email, password], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to register user' });

      return res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    });
  });
});


// POST /api/send-otp
router.post('/send-otp', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const otp = generateOTP();
  saveOTP(email, otp);

  // Optional: Send email using nodemailer here
  console.log(`Generated OTP for ${email}: ${otp}`);

  res.json({ message: 'OTP sent to email (check console for now)' });
});

// Login route with JWT
router.post('/login', (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    return res.status(400).json({ error: 'Email, OTP and Password are required' });
  }

  const saved = getOTP(email);
  if (!saved || saved.otp !== otp) {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }

  const checkQuery = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(checkQuery, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    clearOTP(email);

    const user = results[0];

    // ✅ Create JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  });
});

module.exports = router;