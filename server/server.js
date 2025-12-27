// ===================================
// server.js - MAIN SERVER APPLICATION
// ===================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file (e.g., PORT, MONGODB_URI)
dotenv.config();

// 1. Initialize Express App
const app = express();

// 2. Middleware Setup
app.use(cors()); // Allows requests from your frontend domain
app.use(express.json()); // Allows parsing JSON data in request bodies (req.body)

// 3. Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dadawearDB';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully.'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        // Exit process if DB connection fails
        process.exit(1); 
    });

// 4. Import and Define API Routes
// Note: These files (auth.js, products.js, orders.js) need to be created in the 'routes' folder
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require.require('./routes/orders');
const adminRoutes = require('./routes/admin'); // Separate admin utility routes if needed

// 5. Mount Routes to the App
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// 6. Basic Health Check Route
app.get('/', (req, res) => {
    res.send('DadaXWear Backend Server is running.');
});

// 7. Start the Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`Local URL: http://localhost:${PORT}`);
});
