const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { auth, checkRole } = require('../middleware/authMiddleware');

// @route   GET api/categories
// @desc    Get all categories
router.get('/', auth, async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/categories
// @desc    Create a new category (Admin & Pharmacist)
router.post('/', auth, checkRole(['admin', 'pharmacist']), async (req, res) => {
    const { name, description } = req.body;
    try {
        const newCategory = new Category({ name, description });
        await newCategory.save();
        res.json(newCategory);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
