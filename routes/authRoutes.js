// In routes/authRoutes.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/logout', verifyToken, async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const decoded = jwt.decode(token); // decode token to get expiry
    const expiryDate = new Date(decoded.exp * 1000); // convert to JavaScript Date

    await db.query(
      "INSERT INTO token_blacklist (token, expiry_date) VALUES (?, ?)",
      [token, expiryDate]
    );

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Logout" });
  }
});
