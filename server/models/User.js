// ===================================
// models/User.js - User/Admin Schema
// ===================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Define the User Schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true // Remove whitespace from both ends of a string
    },
    password: {
        type: String,
        required: true
    },
    // To differentiate between regular users and admin
    role: {
        type: String,
        enum: ['user', 'admin'], // Only 'user' or 'admin' allowed
        default: 'user' 
    },
    // Admin specific field (can be used to track who is the main admin)
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// 2. Pre-Save Hook (Middleware) - Hash the password before saving
UserSchema.pre('save', async function(next) {
    // Only hash if the password field is modified (e.g., during creation or reset)
    if (!this.isModified('password')) {
        return next();
    }
    
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 3. Method to Compare Passwords
// This method will be used during login to check the provided password
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
