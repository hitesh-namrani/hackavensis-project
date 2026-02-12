const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String }, // e.g., "Snacks", "Drinks"
    stockCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    imageUrl: { type: String } // Optional for your Items page UI
});

module.exports = mongoose.model('Item', ItemSchema);