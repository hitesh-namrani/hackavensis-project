const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
        quantity: Number,
        name: String
    }],
    totalAmount: Number,
    status: { 
        type: String, 
        enum: ['Pending', 'Preparing', 'Ready', 'Delivered'], 
        default: 'Pending' 
    },
    orderToken: { type: String, unique: true }, // Your digital token verification
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);