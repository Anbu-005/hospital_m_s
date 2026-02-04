const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { authenticateToken, verifyRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware: Only Patient
router.use(authenticateToken, verifyRole(['patient']));

// Get My Profile
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// List Doctors with Stats
router.get('/doctors', async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('-password');

        // Manual aggregation for "experience_count" (appointments completed)
        // In a large system, this should be optimized or pre-calculated
        const doctorsWithStats = await Promise.all(doctors.map(async (doc) => {
            const count = await Appointment.countDocuments({ doctor_id: doc._id, status: 'completed' });
            return {
                ...doc.toObject(),
                id: doc._id,
                experience_count: count
            };
        }));

        res.json(doctorsWithStats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Get Single Doctor Profile
router.get('/doctors/:id', async (req, res) => {
    try {
        const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-password');
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        const count = await Appointment.countDocuments({ doctor_id: doctor._id, status: 'completed' });
        res.json({
            ...doctor.toObject(),
            id: doctor._id,
            experience_count: count
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Book Appointment
router.post('/book', async (req, res) => {
    const { doctor_id, date, time } = req.body;
    if (!doctor_id || !date || !time) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check for double appointment
        const conflict = await Appointment.findOne({
            doctor_id,
            date,
            time,
            status: { $ne: 'rejected' }
        });

        if (conflict) {
            return res.status(409).json({ message: 'Slot already booked for this doctor' });
        }

        const newAppointment = new Appointment({
            doctor_id,
            patient_id: req.user.id,
            date,
            time
        });

        await newAppointment.save();
        res.status(201).json({ message: 'Appointment booked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// View My History
router.get('/history', async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient_id: req.user.id })
            .populate('doctor_id', 'name specialization');

        const formatted = appointments.map(app => ({
            id: app._id,
            date: app.date,
            time: app.time,
            status: app.status,
            doctor_name: app.doctor_id ? app.doctor_id.name : 'Unknown',
            specialization: app.doctor_id ? app.doctor_id.specialization : 'Unknown'
        }));

        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;

