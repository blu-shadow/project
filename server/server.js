// ===================================
// server.js - MAIN SERVER APPLICATION
// ===================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // নতুন যোগ করা হয়েছে (Static file serving এর জন্য)

dotenv.config();

const app = express();

// 1. Middleware Setup
app.use(cors());
app.use(express.json());

// আপনার HTML/JS ফাইলগুলো যেখানে আছে (যদি একই ফোল্ডারে থাকে তবে '.')
app.use(express.static(path.join(__dirname, '.'))); 

// 2. Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dadawearDB';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully.'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1); 
    });

// 3. Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
// 🛑 ভুল ছিল: require.require -> এখন ঠিক করা হয়েছে:
const orderRoutes = require('./routes/orders'); 
const adminRoutes = require('./routes/admin');

// 4. Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// 5. Health Check
app.get('/', (req, res) => {
    res.send('DadaXWear Backend Server is running.');
});

// 6. Start the Server
const PORT = process.env.PORT || 5000;
// '0.0.0.0' ব্যবহার করা হয়েছে যাতে আপনার মোবাইল আইপি থেকে এটি রিচ করা যায়
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`Local Access: http://localhost:${PORT}`);
    console.log(`Network Access: http://192.168.0.102:${PORT}`);
});
