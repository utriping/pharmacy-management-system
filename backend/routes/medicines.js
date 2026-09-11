const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const { auth, checkRole } = require('../middleware/authMiddleware');

// @route   GET api/medicines
// @desc    Get all medicines
router.get('/', auth, async (req, res) => {
    try {
        const medicines = await Medicine.find().populate('category_id');
        const formatted = medicines.map(m => ({
            id: m._id,
            _id: m._id,
            name: m.name,
            category_id: m.category_id ? m.category_id._id : null,
            category_name: m.category_id ? m.category_id.name : 'Uncategorized',
            generic_name: m.generic_name,
            manufacturer: m.manufacturer,
            price: m.price,
            stock_quantity: m.stock_quantity,
            expiry_date: m.expiry_date
        }));
        res.json(formatted);
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
        const newMed = new Medicine({
            name,
            category_id: category_id || null,
            generic_name,
            manufacturer,
            price,
            stock_quantity,
            expiry_date
        });
        await newMed.save();
        res.json(newMed);
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
        const updatedMed = await Medicine.findByIdAndUpdate(
            req.params.id,
            { name, category_id: category_id || null, generic_name, manufacturer, price, stock_quantity, expiry_date },
            { new: true }
        );
        if (!updatedMed) return res.status(404).json({ msg: 'Medicine not found' });
        res.json({ msg: 'Medicine updated successfully', medicine: updatedMed });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/medicines/:id
// @desc    Delete a medicine (Admin only)
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
    try {
        await Medicine.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Medicine removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
