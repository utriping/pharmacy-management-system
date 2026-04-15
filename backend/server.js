const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Pharmacy API is running');
});

// Import Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/suppliers', require('./routes/suppliers'));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

process.on('exit', (code) => {
    console.log('Process exit event with code: ', code);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
// Keep process alive explicitly
setInterval(() => {}, 1000 * 60 * 60);
