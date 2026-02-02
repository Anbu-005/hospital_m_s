const express = require('express');
const db = require('../database');
const { authenticateToken, verifyRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware: Only Patient
router.use(authenticateToken, verifyRole(['patient']));

// List Doctors with Stats
router.get('/doctors', (req, res) => {
    const query = `
        SELECT u.id, u.name, u.email, u.specialization, u.age, u.photo, u.status,
        (SELECT COUNT(*) FROM appointments WHERE doctor_id = u.id AND status = 'completed') as experience_count
        FROM users u
        WHERE u.role = 'doctor'
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// Book Appointment
router.post('/book', (req, res) => {
    const { doctor_id, date, time } = req.body;
    if (!doctor_id || !date || !time) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for double appointment: 
    // 1. Same doctor, same time
    // 2. Same patient, same time (implied preventing double booking for patient too)

    // Note: For simplicity, exact string match on date/time. Ideally use timestamps or ranges.
    const conflictQuery = `
        SELECT * FROM appointments 
        WHERE (doctor_id = ? AND date = ? AND time = ? AND status != 'rejected')
    `;

    db.get(conflictQuery, [doctor_id, date, time], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (row) {
            return res.status(409).json({ message: 'Slot already booked for this doctor' });
        }

        // Insert
        db.run(`INSERT INTO appointments (doctor_id, patient_id, date, time) VALUES (?, ?, ?, ?)`,
            [doctor_id, req.user.id, date, time],
            function (err) {
                if (err) return res.status(500).json({ message: 'Database error: ' + err.message });
                res.status(201).json({ message: 'Appointment booked successfully' });
            }
        );
    });
});

// View My History
router.get('/history', (req, res) => {
    const query = `
        SELECT a.id, a.date, a.time, a.status, d.name as doctor_name, d.specialization
        FROM appointments a
        JOIN users d ON a.doctor_id = d.id
        WHERE a.patient_id = ?
    `;
    db.all(query, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

module.exports = router;
