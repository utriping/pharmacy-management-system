const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Category = require('./models/Category');
const Medicine = require('./models/Medicine');
const Supplier = require('./models/Supplier');
const Sale = require('./models/Sale');
const Purchase = require('./models/Purchase');

async function migrateData() {
    let sqlConnection;
    try {
        console.log('--- Starting Data Migration from MySQL to MongoDB ---');

        // 1. Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pharmacy_db';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB.');

        // Clear existing MongoDB data to prevent duplicate records
        await User.deleteMany({});
        await Category.deleteMany({});
        await Medicine.deleteMany({});
        await Supplier.deleteMany({});
        await Sale.deleteMany({});
        await Purchase.deleteMany({});
        console.log('Cleared existing MongoDB collections.');

        // 2. Connect to MySQL
        try {
            sqlConnection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASS || '',
                database: process.env.DB_NAME || 'pharmacy_db'
            });
            console.log('Connected to MySQL server.');
        } catch (sqlErr) {
            console.log('MySQL connection warning:', sqlErr.message);
            console.log('If MySQL database does not exist or has no active data, MongoDB seeder will handle default setup.');
        }

        const userIdMap = {};
        const categoryIdMap = {};
        const supplierIdMap = {};
        const medicineIdMap = {};

        if (sqlConnection) {
            // A. Migrate Users
            try {
                const [sqlUsers] = await sqlConnection.query('SELECT * FROM users');
                for (const u of sqlUsers) {
                    const mongoUser = await User.create({
                        name: u.name,
                        email: u.email,
                        password: u.password,
                        role: u.role,
                        created_at: u.created_at || new Date()
                    });
                    userIdMap[u.id] = mongoUser._id;
                }
                console.log(`Migrated ${Object.keys(userIdMap).length} Users.`);
            } catch (e) {
                console.log('No users table or error migrating users:', e.message);
            }

            // B. Migrate Categories
            try {
                const [sqlCategories] = await sqlConnection.query('SELECT * FROM categories');
                for (const c of sqlCategories) {
                    const mongoCat = await Category.create({
                        name: c.name,
                        description: c.description
                    });
                    categoryIdMap[c.id] = mongoCat._id;
                }
                console.log(`Migrated ${Object.keys(categoryIdMap).length} Categories.`);
            } catch (e) {
                console.log('No categories table or error migrating categories:', e.message);
            }

            // C. Migrate Suppliers
            try {
                const [sqlSuppliers] = await sqlConnection.query('SELECT * FROM suppliers');
                for (const s of sqlSuppliers) {
                    const mongoSup = await Supplier.create({
                        name: s.name,
                        contact_info: s.contact_info,
                        address: s.address
                    });
                    supplierIdMap[s.id] = mongoSup._id;
                }
                console.log(`Migrated ${Object.keys(supplierIdMap).length} Suppliers.`);
            } catch (e) {
                console.log('No suppliers table or error migrating suppliers:', e.message);
            }

            // D. Migrate Medicines
            try {
                const [sqlMedicines] = await sqlConnection.query('SELECT * FROM medicines');
                for (const m of sqlMedicines) {
                    const mongoMed = await Medicine.create({
                        name: m.name,
                        category_id: categoryIdMap[m.category_id] || null,
                        generic_name: m.generic_name,
                        manufacturer: m.manufacturer,
                        price: parseFloat(m.price),
                        stock_quantity: parseInt(m.stock_quantity, 10),
                        expiry_date: m.expiry_date
                    });
                    medicineIdMap[m.id] = mongoMed._id;
                }
                console.log(`Migrated ${Object.keys(medicineIdMap).length} Medicines.`);
            } catch (e) {
                console.log('No medicines table or error migrating medicines:', e.message);
            }

            // E. Migrate Purchases
            try {
                const [sqlPurchases] = await sqlConnection.query('SELECT * FROM purchases');
                for (const p of sqlPurchases) {
                    const [items] = await sqlConnection.query('SELECT * FROM purchase_items WHERE purchase_id = ?', [p.id]);
                    const mappedItems = items.map(item => ({
                        medicine_id: medicineIdMap[item.medicine_id],
                        quantity: item.quantity,
                        unit_price: parseFloat(item.unit_price)
                    })).filter(i => i.medicine_id);

                    await Purchase.create({
                        supplier_id: supplierIdMap[p.supplier_id] || null,
                        total_amount: parseFloat(p.total_amount),
                        purchase_date: p.purchase_date || new Date(),
                        items: mappedItems
                    });
                }
                console.log(`Migrated ${sqlPurchases.length} Purchases.`);
            } catch (e) {
                console.log('No purchases table or error migrating purchases:', e.message);
            }

            // F. Migrate Sales
            try {
                const [sqlSales] = await sqlConnection.query('SELECT * FROM sales');
                for (const s of sqlSales) {
                    const [items] = await sqlConnection.query('SELECT * FROM sale_items WHERE sale_id = ?', [s.id]);
                    const mappedItems = items.map(item => ({
                        medicine_id: medicineIdMap[item.medicine_id],
                        quantity: item.quantity,
                        unit_price: parseFloat(item.unit_price)
                    })).filter(i => i.medicine_id);

                    await Sale.create({
                        user_id: userIdMap[s.user_id] || null,
                        total_amount: parseFloat(s.total_amount),
                        sale_date: s.sale_date || new Date(),
                        items: mappedItems
                    });
                }
                console.log(`Migrated ${sqlSales.length} Sales.`);
            } catch (e) {
                console.log('No sales table or error migrating sales:', e.message);
            }
        }

        console.log('--- Migration completed successfully! ---');
    } catch (err) {
        console.error('Fatal migration error:', err);
    } finally {
        if (sqlConnection) await sqlConnection.end();
        await mongoose.disconnect();
        process.exit();
    }
}

migrateData();
