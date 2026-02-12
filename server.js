const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Middleware
app.use(express.json()); 
app.use(express.static('public')); // Serves all your HTML files

// Database Connection
mongoose.connect('YOUR_MONGODB_URI_HERE')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Canteen OS live on port ${PORT}`));