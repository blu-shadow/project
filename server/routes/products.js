// ===================================
// routes/products.js - Product Management Routes
// ===================================

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Fetch all products (For the main store page - index.html)
// @route   GET /api/products
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
    // Fetch all products from the database
    const products = await Product.find({});
    res.json(products);
}));

// @desc    Fetch single product by ID (For product details page)
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
}));


// --- ADMIN Routes for Product Management (Requires Auth & Admin Role) ---

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
    // 1. Get data from request body
    const { name, price, description, image, countInStock, sizes } = req.body;

    // 2. Simple Slug generation (Better utility needed in production)
    const slug = name.toLowerCase().replace(/ /g, '-').substring(0, 50);

    // 3. Create the product
    const product = new Product({
        name,
        slug,
        price,
        description,
        image,
        countInStock,
        sizes,
        // The user who created this product (admin)
        user: req.user._id, 
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
}));

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
    const { name, price, description, image, countInStock, sizes } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        // Update fields
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.image = image || product.image;
        product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
        product.sizes = sizes || product.sizes;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
}));


// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
}));


module.exports = router;
