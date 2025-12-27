// ===================================
// routes/admin.js - Admin Utility Routes
// ===================================

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Create the initial admin user (Only needed once for setup)
// @route   POST /api/admin/create-first-admin
// @access  Public (Should be run only once, then removed or protected)
router.post('/create-first-admin', asyncHandler(async (req, res) => {
    // IMPORTANT: In a real application, you would highly restrict this route.
    // We keep it open for easy initial setup only.
    
    // Check if an admin already exists to prevent misuse
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
        return res.status(400).json({ message: 'Admin user already exists. Cannot create another via this open route.' });
    }

    // You can hardcode the initial admin username and password here for testing
    const username = 'admin'; // Use a standard admin username
    const password = 'dadawear123'; // Use the password you mentioned

    const adminUser = await User.create({
        username,
        password, // This password will be hashed by the User model's pre-save hook
        role: 'admin',
        isAdmin: true
    });

    if (adminUser) {
        res.status(201).json({
            message: 'First Admin User created successfully. Please use /api/auth/login to access.',
            username: adminUser.username
        });
    } else {
        res.status(400).json({ message: 'Invalid admin data' });
    }
}));

// @desc    Get all users (Example of a protected admin route)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, asyncHandler(async (req, res) => {
    // This route requires both token validation (protect) and admin role check (admin)
    const users = await User.find({});
    res.json(users);
}));


module.exports = router;
