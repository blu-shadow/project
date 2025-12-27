// ===================================
// routes/auth.js - Admin/User Authentication Routes
// ===================================

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const asyncHandler = require('express-async-handler'); // For simplifying error handling
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

// @desc    Authenticate admin/user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ username });

    // 2. Check password and user existence
    if (user && (await user.matchPassword(password))) {
        // Successful login
        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id), // Generate token for future requests
        });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
}));


// @desc    Register a new user (Optional: Can be extended for customer signup)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
    const { username, password, role } = req.body;

    const userExists = await User.findOne({ username });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        username,
        password,
        // Ensure that new users are not accidentally set as admin during general registration
        role: role === 'admin' ? 'user' : role || 'user', 
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
}));


module.exports = router;
