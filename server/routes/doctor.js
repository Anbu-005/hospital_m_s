const express = require('express');
const db = require('../database');
const { authenticateToken, verifyRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware: Only Doctor
router.use(authenticateToken, verifyRole(['doctor']));

// Get My Appointments
router.get('/appointments', (req, res) => {
    const query = `
        SELECT a.id, a.date, a.time, a.status, p.name as patient_name, p.id as patient_id
        FROM appointments a
        JOIN users p ON a.patient_id = p.id
        WHERE a.doctor_id = ?
    `;
    db.all(query, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// Update Appointment Status (Reject/Complete)
router.put('/appointment/:id', (req, res) => {
    const { status } = req.body; // 'completed', 'rejected'
    if (!['completed', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    db.run(`UPDATE appointments SET status = ? WHERE id = ? AND doctor_id = ?`,
        [status, req.params.id, req.user.id],
        function (err) {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (this.changes === 0) return res.status(404).json({ message: 'Appointment not found' });
            res.json({ message: `Appointment ${status}` });
        }
    );
});

// Request Leave
router.post('/leave', (req, res) => {
    db.run(`UPDATE users SET status = 'leave_requested' WHERE id = ?`, [req.user.id], (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Leave requested' });
    });
});

// Request Return to Work
router.post('/return-work', (req, res) => {
    db.run(`UPDATE users SET status = 'return_requested' WHERE id = ?`, [req.user.id], (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Return to work requested' });
    });
});

// Get My Profile (with status)
router.get('/me', (req, res) => {
    db.get(`SELECT id, name, email, status, specialization, photo, age FROM users WHERE id = ?`, [req.user.id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(row);
    });
});

// View Patient Profile/History (For a patient they have an appointment with or general lookup? Requirement: "doctor also see the patient profile and histroy")
router.get('/patient/:id', (req, res) => {
    // Get patient details
    db.get(`SELECT id, name, email FROM users WHERE id = ? AND role = 'patient'`, [req.params.id], (err, patient) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        // Get history
        const historyQuery = `
            SELECT a.date, a.time, a.status, d.name as doctor_name
            FROM appointments a
            JOIN users d ON a.doctor_id = d.id
            WHERE a.patient_id = ?
        `;
        db.all(historyQuery, [req.params.id], (err, history) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json({ profile: patient, history });
        });
    });
});

module.exports = router;
