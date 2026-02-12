const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Use bcrypt.js for hashing as planned
    role: { type: String, enum: ['student', 'owner'], default: 'student' }
});

module.exports = mongoose.model('User', UserSchema);