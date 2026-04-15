const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
    let connection;
    try {
        // Connect without database selected first to create it
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
        });

        console.log('Connected to MySQL server.');

        // Create Database
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        console.log(`Database ${process.env.DB_NAME} created or already exists.`);

        // Switch to the database
        await connection.query(`USE \`${process.env.DB_NAME}\``);

        // Create Tables
        const schema = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'pharmacist', 'cashier') NOT NULL DEFAULT 'cashier',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT
            );

            CREATE TABLE IF NOT EXISTS medicines (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category_id INT,
                generic_name VARCHAR(255) NOT NULL,
                manufacturer VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                stock_quantity INT NOT NULL DEFAULT 0,
                expiry_date DATE NOT NULL,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS suppliers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                contact_info VARCHAR(255),
                address TEXT
            );

            CREATE TABLE IF NOT EXISTS purchases (
                id INT AUTO_INCREMENT PRIMARY KEY,
                supplier_id INT,
                total_amount DECIMAL(10, 2) NOT NULL,
                purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS purchase_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                purchase_id INT,
                medicine_id INT,
                quantity INT NOT NULL,
                unit_price DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
                FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT
            );

            CREATE TABLE IF NOT EXISTS sales (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                total_amount DECIMAL(10, 2) NOT NULL,
                sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS sale_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sale_id INT,
                medicine_id INT,
                quantity INT NOT NULL,
                unit_price DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
                FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT
            );
        `;

        // Split schema into individual queries
        const schemaQueries = schema.split(';').filter(q => q.trim());
        for (const query of schemaQueries) {
            await connection.query(query);
        }
        console.log('Tables created or already exist.');

        // Clear existing data to avoid duplicates (optional but good for seeding)
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('TRUNCATE TABLE sale_items');
        await connection.query('TRUNCATE TABLE sales');
        await connection.query('TRUNCATE TABLE purchase_items');
        await connection.query('TRUNCATE TABLE purchases');
        await connection.query('TRUNCATE TABLE medicines');
        await connection.query('TRUNCATE TABLE categories');
        await connection.query('TRUNCATE TABLE suppliers');
        await connection.query('TRUNCATE TABLE users');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('Cleared existing data.');

        // Insert mock data
        // 1. Users
        const passwordHash = await bcrypt.hash('password123', 10);
        await connection.query(
            "INSERT INTO users (name, email, password, role) VALUES ?",
            [[
                ['Admin User', 'admin@pharmacy.com', passwordHash, 'admin'],
                ['Pharmacist User', 'pharmacist@pharmacy.com', passwordHash, 'pharmacist'],
                ['Cashier User', 'cashier@pharmacy.com', passwordHash, 'cashier']
            ]]
        );

        // 2. Categories
        await connection.query(
            "INSERT INTO categories (name, description) VALUES ?",
            [[
                ['Painkillers', 'Medicines used for pain relief'],
                ['Antibiotics', 'Medicines that destroy or slow down the growth of bacteria'],
                ['Vitamins', 'Nutritional supplements'],
                ['Syrups', 'Liquid medications']
            ]]
        );

        // 3. Suppliers
        await connection.query(
            "INSERT INTO suppliers (name, contact_info, address) VALUES ?",
            [[
                ['MedSupply Inc.', '123-456-7890', '12 Industry Way'],
                ['Global Pharma Distributors', '098-765-4321', '88 Health Avenue']
            ]]
        );

        // 4. Medicines
        await connection.query(
            "INSERT INTO medicines (name, category_id, generic_name, manufacturer, price, stock_quantity, expiry_date) VALUES ?",
            [[
                ['Paracetamol 500mg', 1, 'Acetaminophen', 'PharmaCare', 5.99, 500, '2026-12-31'],
                ['Ibuprofen 400mg', 1, 'Ibuprofen', 'HealthPlus', 8.50, 300, '2025-10-15'],
                ['Amoxicillin 250mg', 2, 'Amoxicillin', 'GlobalPharma', 12.00, 200, '2025-05-20'],
                ['Vitamin C 1000mg', 3, 'Ascorbic Acid', 'NutriLife', 15.99, 150, '2027-01-01'],
                ['Cough Syrup', 4, 'Dextromethorphan', 'PharmaCare', 9.50, 100, '2026-06-30']
            ]]
        );

        console.log('Mock data inserted successfully.');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
        process.exit();
    }
}

seedDatabase();
