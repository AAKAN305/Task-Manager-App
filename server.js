const express = require('express');
const db = require('./db');
const verifyToken = require('./middlewares/authMiddleware');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

// Get all users
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching users');
    }
    res.json(results);
  });
});

// app.get('/protected', verifyToken, (req, res) => {
//   res.json({ message: 'You accessed a protected route', user: req.user });
// }); 

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// const userRoutes = require('./routes/userRoutes');
// app.use('/api', userRoutes);

// ✅ Protected route
app.get('/protected', verifyToken, (req, res) => {
  res.json({
    message: 'You accessed a protected route',
    user: req.user,
  });
});

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

