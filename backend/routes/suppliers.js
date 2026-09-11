const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const { auth, checkRole } = require('../middleware/authMiddleware');

// @route   GET api/suppliers
// @desc    Get all suppliers
router.get('/', auth, checkRole(['admin', 'pharmacist']), async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.json(suppliers);
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
        const newSupplier = new Supplier({ name, contact_info, address });
        await newSupplier.save();
        res.json(newSupplier);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
