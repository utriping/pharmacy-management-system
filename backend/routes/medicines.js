const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, checkRole } = require('../middleware/authMiddleware');

// @route   GET api/medicines
// @desc    Get all medicines
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.*, c.name as category_name 
            FROM medicines m 
            LEFT JOIN categories c ON m.category_id = c.id
        `);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/medicines
// @desc    Add a new medicine (Admin & Pharmacist)
router.post('/', auth, checkRole(['admin', 'pharmacist']), async (req, res) => {
    const { name, category_id, generic_name, manufacturer, price, stock_quantity, expiry_date } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO medicines (name, category_id, generic_name, manufacturer, price, stock_quantity, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, category_id, generic_name, manufacturer, price, stock_quantity, expiry_date]
        );
        res.json({ id: result.insertId, ...req.body });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/medicines/:id
// @desc    Update a medicine (Admin & Pharmacist)
router.put('/:id', auth, checkRole(['admin', 'pharmacist']), async (req, res) => {
    const { name, category_id, generic_name, manufacturer, price, stock_quantity, expiry_date } = req.body;
    try {
        await pool.query(
            'UPDATE medicines SET name = ?, category_id = ?, generic_name = ?, manufacturer = ?, price = ?, stock_quantity = ?, expiry_date = ? WHERE id = ?',
            [name, category_id, generic_name, manufacturer, price, stock_quantity, expiry_date, req.params.id]
        );
        res.json({ msg: 'Medicine updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/medicines/:id
// @desc    Delete a medicine (Admin only)
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
    try {
        await pool.query('DELETE FROM medicines WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Medicine removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
