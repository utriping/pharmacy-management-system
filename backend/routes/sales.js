const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/authMiddleware');

// @route   POST api/sales
// @desc    Create a new sale
router.post('/', auth, async (req, res) => {
    const { items, total_amount } = req.body; // items: [{ medicine_id, quantity, unit_price }]
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Create Sale Record
        const [saleResult] = await connection.query(
            'INSERT INTO sales (user_id, total_amount) VALUES (?, ?)',
            [req.user.id, total_amount]
        );
        const saleId = saleResult.insertId;

        // 2. Insert Sale Items & Update Stock
        for (let item of items) {
            // Check stock first
            const [medRows] = await connection.query('SELECT stock_quantity FROM medicines WHERE id = ? FOR UPDATE', [item.medicine_id]);
            if (medRows.length === 0 || medRows[0].stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for medicine ID: ${item.medicine_id}`);
            }

            // Insert item
            await connection.query(
                'INSERT INTO sale_items (sale_id, medicine_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
                [saleId, item.medicine_id, item.quantity, item.unit_price]
            );

            // Update Stock
            await connection.query(
                'UPDATE medicines SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [item.quantity, item.medicine_id]
            );
        }

        await connection.commit();
        res.json({ msg: 'Sale completed successfully', saleId });
    } catch (err) {
        await connection.rollback();
        console.error(err.message);
        res.status(400).json({ msg: err.message || 'Server Error Transaction Failed' });
    } finally {
        connection.release();
    }
});

// @route   GET api/sales
// @desc    Get all sales (Admin & Pharmacist)
router.get('/', auth, async (req, res) => {
    if(!['admin', 'pharmacist'].includes(req.user.role)) {
       return res.status(403).json({ msg: 'Access denied' });
    }
    try {
        const [rows] = await pool.query('SELECT s.*, u.name as user_name FROM sales s JOIN users u ON s.user_id = u.id ORDER BY sale_date DESC');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
