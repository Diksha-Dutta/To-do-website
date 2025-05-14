const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login Request:', { email, password: '[provided]' });

  try {
    const user = await User.findOne({ email });
    console.log('User found:', user ? { email: user.email, name: user.name } : null);

    if (!user) {
      console.log('No user found with that email.');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await user.comparePassword(password.trim());
    console.log('Password match:', passwordMatch);

    if (passwordMatch) {
      req.session.userId = user._id;
      return res.status(201).json({ message: 'Login successful', redirect: '/' });
    } else {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'An error occurred during login' });
  }
});

    
module.exports = router;