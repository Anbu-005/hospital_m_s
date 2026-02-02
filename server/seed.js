const db = require('./database');
const bcrypt = require('bcryptjs');

const seed = async () => {
    const password = await bcrypt.hash('admin123', 10);

    // Simple delay to ensure tables are created by database.js
    setTimeout(() => {
        db.serialize(() => {
            // Seed Admin
            db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
                ['Super Admin', 'admin@hms.com', password, 'admin'],
                (err) => {
                    if (err && !err.message.includes('UNIQUE constraint failed')) console.error(err);
                }
            );

            // Seed Demo Doctor
            db.run(`INSERT INTO users (name, email, password, role, specialization, age, photo, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ['Dr. Sarah Smith', 'sarah@hms.com', password, 'doctor', 'Cardiology', 35, 'https://randomuser.me/api/portraits/women/44.jpg', '555-0123', 'active'],
                (err) => {
                    if (err && !err.message.includes('UNIQUE constraint failed')) console.error(err);
                    else console.log('Database seeded!');
                }
            );
        });
    }, 1000);
};

seed();
