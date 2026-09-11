const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');
const Medicine = require('./models/Medicine');
const Sale = require('./models/Sale');
const Purchase = require('./models/Purchase');

async function seedDatabase() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pharmacy_db';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for seeding.');

        // Clear existing data
        await User.deleteMany({});
        await Category.deleteMany({});
        await Supplier.deleteMany({});
        await Medicine.deleteMany({});
        await Sale.deleteMany({});
        await Purchase.deleteMany({});
        console.log('Cleared existing MongoDB data.');

        // 1. Insert Users
        const passwordHash = await bcrypt.hash('password123', 10);
        const users = await User.insertMany([
            { name: 'Admin User', email: 'admin@pharmacy.com', password: passwordHash, role: 'admin' },
            { name: 'Pharmacist User', email: 'pharmacist@pharmacy.com', password: passwordHash, role: 'pharmacist' },
            { name: 'Cashier User', email: 'cashier@pharmacy.com', password: passwordHash, role: 'cashier' }
        ]);
        console.log(`Seeded ${users.length} Users.`);

        // 2. Insert Categories
        const categories = await Category.insertMany([
            { name: 'Painkillers', description: 'Medicines used for pain relief' },
            { name: 'Antibiotics', description: 'Medicines that destroy or slow down bacteria' },
            { name: 'Vitamins', description: 'Nutritional supplements' },
            { name: 'Syrups', description: 'Liquid medications' }
        ]);
        console.log(`Seeded ${categories.length} Categories.`);

        // 3. Insert Suppliers
        const suppliers = await Supplier.insertMany([
            { name: 'MedSupply Inc.', contact_info: '123-456-7890', address: '12 Industry Way' },
            { name: 'Global Pharma Distributors', contact_info: '098-765-4321', address: '88 Health Avenue' }
        ]);
        console.log(`Seeded ${suppliers.length} Suppliers.`);

        // 4. Insert Medicines
        const medicines = await Medicine.insertMany([
            { name: 'Paracetamol 500mg', category_id: categories[0]._id, generic_name: 'Acetaminophen', manufacturer: 'PharmaCare', price: 5.99, stock_quantity: 500, expiry_date: new Date('2026-12-31') },
            { name: 'Ibuprofen 400mg', category_id: categories[0]._id, generic_name: 'Ibuprofen', manufacturer: 'HealthPlus', price: 8.50, stock_quantity: 300, expiry_date: new Date('2025-10-15') },
            { name: 'Amoxicillin 250mg', category_id: categories[1]._id, generic_name: 'Amoxicillin', manufacturer: 'GlobalPharma', price: 12.00, stock_quantity: 200, expiry_date: new Date('2025-05-20') },
            { name: 'Vitamin C 1000mg', category_id: categories[2]._id, generic_name: 'Ascorbic Acid', manufacturer: 'NutriLife', price: 15.99, stock_quantity: 150, expiry_date: new Date('2027-01-01') },
            { name: 'Cough Syrup', category_id: categories[3]._id, generic_name: 'Dextromethorphan', manufacturer: 'PharmaCare', price: 9.50, stock_quantity: 100, expiry_date: new Date('2026-06-30') }
        ]);
        console.log(`Seeded ${medicines.length} Medicines.`);

        console.log('MongoDB Database Seeded Successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

seedDatabase();
