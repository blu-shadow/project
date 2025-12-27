// ===================================
// models/Product.js - Product Schema
// ===================================

const mongoose = require('mongoose');

// 1. Define the Product Schema
const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true // Product names should ideally be unique
    },
    slug: { // URL friendly name (e.g., manchester-jersey-home-2024)
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    price: {
        type: Number,
        required: true,
        min: 0 // Price must be non-negative
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String, // URL or file path for the main image
        required: true
    },
    // Stock/inventory tracking
    countInStock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    // Available sizes (assuming S, M, L, XL, etc.)
    sizes: [{ 
        type: String,
        enum: ['S', 'M', 'L', 'XL', 'XXL'], // Define possible sizes
        required: true
    }],
    category: {
        type: String,
        default: 'Jersey'
    }
}, {
    timestamps: true 
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
