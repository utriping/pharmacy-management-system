const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, checkRole } = require('../middleware/authMiddleware');

// @route   GET api/suppliers
// @desc    Get all suppliers
router.get('/', auth, checkRole(['admin', 'pharmacist']), async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM suppliers');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/suppliers
// @desc    Create a new supplier (Admin & Pharmacist)
router.post('/', auth, checkRole(['admin', 'pharmacist']), async (req, res) => {
    const { name, contact_info, address } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO suppliers (name, contact_info, address) VALUES (?, ?, ?)',
            [name, contact_info, address]
        );
        res.json({ id: result.insertId, name, contact_info, address });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
