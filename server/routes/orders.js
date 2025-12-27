// ===================================
// routes/orders.js - Order Management Routes
// ===================================

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Create a new order (Checkout process)
// @route   POST /api/orders
// @access  Public (Guest checkout is allowed)
router.post('/', asyncHandler(async (req, res) => {
    const { 
        orderItems, 
        shippingAddress, 
        paymentMethod, 
        transactionId, 
        itemsPrice, 
        shippingPrice, 
        totalPrice 
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    }

    // Determine the user (if logged in) or keep it null for guest checkout
    const userId = req.user ? req.user._id : null; 

    const order = new Order({
        // user: userId, // Uncomment this line if you implement user login for customers
        orderItems,
        shippingAddress,
        paymentMethod,
        transactionId,
        itemsPrice,
        shippingPrice,
        totalPrice
    });

    // Save the order to the database (This is what solves the "order loss" problem)
    const createdOrder = await order.save();
    
    // Optionally: Reduce countInStock for each product here

    res.status(201).json(createdOrder);
}));


// --- ADMIN Routes for Order Management (Requires Auth & Admin Role) ---

// @desc    Fetch all orders (For admin.html)
// @route   GET /api/orders/all
// @access  Private/Admin
router.get('/all', protect, admin, asyncHandler(async (req, res) => {
    // Fetch all orders, and populate the 'user' field (if linked)
    // We sort them by creation date (newest first)
    const orders = await Order.find({})
        .sort({ createdAt: -1 }) // Sort by latest orders
        // .populate('user', 'username'); // Uncomment if customer user model is fully used
    
    res.json(orders);
}));


// @desc    Update order status (e.g., set to Shipped or Delivered)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    const { status } = req.body;

    if (order) {
        order.status = status || order.status; // Update status
        
        // Optionally: Update delivery date if status is 'Delivered'
        if (status === 'Delivered' && !order.deliveredAt) {
             order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
}));


module.exports = router;
