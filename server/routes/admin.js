const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const { authenticateToken, verifyRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware: Only Admin
router.use(authenticateToken, verifyRole(['admin']));

// Add Doctor
router.post('/doctor', upload.single('photo'), async (req, res) => {
    const { name, email, password, specialization, age, phone } = req.body;
    if (!name || !email || !password || !specialization) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Photo URL construction
    const photoUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : 'https://via.placeholder.com/150';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (name, email, password, role, specialization, age, photo, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [name, email, hashedPassword, 'doctor', specialization, age || null, photoUrl, phone || null],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ message: 'Email already exists' });
                    }
                    return res.status(500).json({ message: 'Database error' });
                }
                res.status(201).json({ message: 'Doctor added successfully' });
            }
        );
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Doctors
router.get('/doctors', (req, res) => {
    const query = `
        SELECT id, name, email, specialization, age, photo, phone, status 
        FROM users WHERE role = 'doctor'
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// Delete Doctor
router.delete('/doctor/:id', (req, res) => {
    db.run(`DELETE FROM users WHERE id = ? AND role = 'doctor'`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Doctor deleted' });
    });
});

// Update Doctor Status
router.put('/doctor/:id/status', (req, res) => {
    const { status } = req.body;
    db.run(`UPDATE users SET status = ? WHERE id = ?`, [status, req.params.id], (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Status updated' });
    });
});

// View All Appointments
router.get('/appointments', (req, res) => {
    const query = `
        SELECT a.id, a.date, a.time, a.status, 
               d.name as doctor_name, p.name as patient_name 
        FROM appointments a
        JOIN users d ON a.doctor_id = d.id
        JOIN users p ON a.patient_id = p.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// View All Patients (simplified fetch)
router.get('/patients', (req, res) => {
    db.all(`SELECT id, name, email FROM users WHERE role = 'patient'`, [], (err, patients) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(patients);
    });
});

module.exports = router;
