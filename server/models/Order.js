// ===================================
// models/Order.js - Order Schema
// ===================================

const mongoose = require('mongoose');

// Define a Sub-Schema for individual items within an order
const OrderItemSchema = new mongoose.Schema({
    // Reference to the Product model
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product' // Links this item to the actual Product in the database
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    size: { type: String, required: true }, // The selected size (e.g., 'L', 'XL')
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
});

// Define the main Order Schema
const OrderSchema = new mongoose.Schema({
    // User who placed the order (optional, as guests can order)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Links to the User model (if logged in)
    },
    // The list of items in the order
    orderItems: [OrderItemSchema],

    // Shipping Information (as collected from your checkout form)
    shippingAddress: {
        fullName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        fullAddress: { type: String, required: true } // Street, City, Post Code
    },

    // Payment Details
    paymentMethod: {
        type: String,
        required: true,
        enum: ['bkash', 'nogod', 'cod'] // Add Cash on Delivery if supported
    },
    transactionId: { // TrxID from bKash/Nogod
        type: String,
        required: function() {
            // Transaction ID is only required for bKash or Nogod payments
            return this.paymentMethod === 'bkash' || this.paymentMethod === 'nogod';
        }
    },

    // Price Details
    itemsPrice: { type: Number, required: true, default: 0.0 }, // Subtotal
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 }, // Final Total

    // Order Status and Tracking
    isPaid: { type: Boolean, default: false }, // Has payment been confirmed?
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },

    // For Admin Use: Order Status (Pending, Processing, Shipped, Cancelled)
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
