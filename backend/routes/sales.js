const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const { auth } = require('../middleware/authMiddleware');

// @route   POST api/sales
// @desc    Create a new sale
router.post('/', auth, async (req, res) => {
    const { items, total_amount } = req.body; // items: [{ medicine_id, quantity, unit_price }]

    try {
        if (!items || items.length === 0) {
            return res.status(400).json({ msg: 'No items in cart' });
        }

        // 1. Verify stock for all items
        for (let item of items) {
            const med = await Medicine.findById(item.medicine_id);
            if (!med || med.stock_quantity < item.quantity) {
                return res.status(400).json({ msg: `Insufficient stock for medicine: ${med ? med.name : item.medicine_id}` });
            }
        }

        // 2. Deduct stock
        for (let item of items) {
            await Medicine.findByIdAndUpdate(item.medicine_id, {
                $inc: { stock_quantity: -item.quantity }
            });
        }

        // 3. Create Sale Record
        const newSale = new Sale({
            user_id: req.user.id,
            total_amount,
            items
        });
        await newSale.save();

        res.json({ msg: 'Sale completed successfully', saleId: newSale._id });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: err.message || 'Server Error Transaction Failed' });
    }
});

// @route   GET api/sales
// @desc    Get all sales (Admin & Pharmacist)
router.get('/', auth, async (req, res) => {
    if (!['admin', 'pharmacist'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Access denied' });
    }
    try {
        const sales = await Sale.find().populate('user_id', 'name email').sort({ sale_date: -1 });
        const formatted = sales.map(s => ({
            id: s._id,
            _id: s._id,
            user_id: s.user_id ? s.user_id._id : null,
            user_name: s.user_id ? s.user_id.name : 'Unknown User',
            total_amount: s.total_amount,
            sale_date: s.sale_date,
            items: s.items
        }));
        res.json(formatted);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
