const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect MongoDB Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Pharmacy API is running with MongoDB');
});

// Import Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/suppliers', require('./routes/suppliers'));

const PORT = process.env.PORT || 5000;

// Global error handlers to capture unexpected crashes
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
});

console.log(`Starting server on port ${PORT}`);
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
