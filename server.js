const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// --- Import Models ---
const User = require('./models/User');
const Item = require('./models/Item');
const Order = require('./models/Order');

// --- Middleware ---
app.use(express.json()); 
app.use(express.static('public')); // Serves your HTML/CSS/JS files

// --- Database Connection ---
mongoose.connect('mongodb://localhost:27017/canteenOS')
  .then(() => console.log('MongoDB Connected (Local-First)'))
  .catch(err => console.error('Connection Error:', err));

// ==========================
//      AUTH ROUTES
// ==========================

// 1. Sign Up (For New Students)
app.post('/api/signup', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User({ username, password, role });
        await newUser.save();
        
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Login (For Students & Owners)
app.post('/api/login', async (req, res) => {
    try {
        const { rollNo, password } = req.body;
        
        // Find user (Schema uses 'username', Frontend sends 'rollNo')
        const user = await User.findOne({ username: rollNo });

        if (!user) {
            return res.status(401).json({ message: "Invalid Roll Number" });
        }

        // Simple password check
        if (user.password === password) {
            res.status(200).json({ 
                message: "Login Successful", 
                role: user.role 
            });
        } else {
            res.status(401).json({ message: "Incorrect Password" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ==========================
//      CORE APP ROUTES
// ==========================

// 3. Fetch Menu Items
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find({ isAvailable: true });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Place Order (With Inventory Sync)
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order({
            ...req.body,
            orderToken: 'TK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            status: 'Pending'
        });
        await newOrder.save();
        
        // Inventory Auto-Sync Logic
        if (req.body.items && req.body.items.length > 0) {
            for (let item of req.body.items) {
                await Item.findByIdAndUpdate(item.itemId, { $inc: { stockCount: -item.quantity } });
            }
        }
        
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 5. Update Order Status (Owner Dashboard)
app.patch('/api/orders/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true }
        );
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 6. Fetch All Orders (Owner Dashboard)
app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Start Server ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Canteen OS live at http://localhost:${PORT}`);
});
// Fetch All Orders (Used for Admin AND History for this demo)
app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});