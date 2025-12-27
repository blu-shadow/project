// ===================================
// middleware/authMiddleware.js
// ===================================

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model

// Middleware to protect routes (ensure user is logged in)
const protect = async (req, res, next) => {
    let token;

    // 1. Check if token exists in the Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (Format: Bearer <token>)
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Find user and attach to request object
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Proceed to the route handler

        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to restrict access to only admins
const admin = (req, res, next) => {
    // Check if the user is authenticated AND has the role 'admin'
    if (req.user && req.user.role === 'admin') {
        next(); // Proceed to the route handler
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
