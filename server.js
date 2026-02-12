const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Import Models [cite: 29]
const User = require('./models/User');
const Item = require('./models/Item');
const Order = require('./models/Order');

// Middleware
app.use(express.json()); 
app.use(express.static('public')); // Serves your HTML/CSS/JS [cite: 25, 27]

// Database Connection [cite: 29, 34]
mongoose.connect('mongodb://localhost:27017/canteenOS')
  .then(() => console.log('MongoDB Connected (Local-First)'))
  .catch(err => console.error('Connection Error:', err));

// --- API ROUTES ---

// 1. Fetch Menu (For Student & Owner) [cite: 11]
app.get('/api/items', async (req, res) => {
    const items = await Item.find({ isAvailable: true });
    res.json(items);
});

// 2. Place Order (Student) [cite: 36]
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order({
            ...req.body,
            orderToken: 'TK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            status: 'Pending'
        });
        await newOrder.save();
        
        // Logic for Inventory Auto-Sync [cite: 20, 44]
        for (let item of req.body.items) {
            await Item.findByIdAndUpdate(item.itemId, { $inc: { stockCount: -item.quantity } });
        }
        
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. Update Order Status (Owner Dashboard) 
app.patch('/api/orders/:id', async (req, res) => {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updatedOrder);
});

// 4. Fetch Orders for Owner [cite: 37]
app.get('/api/admin/orders', async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
});

// Start Server [cite: 27]
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Canteen OS live at http://localhost:${PORT}`);
});