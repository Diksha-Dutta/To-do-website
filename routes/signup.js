const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('Signup Request:', { name, email, password: '[provided]' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();
    console.log('User created:', { email, name });
    res.status(201).json({ message: 'Signup successful', redirect: '/login.html' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(400).json({ message: 'Error creating user' });
  }
});

module.exports = router;