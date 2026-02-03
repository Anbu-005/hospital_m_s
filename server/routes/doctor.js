const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { authenticateToken, verifyRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware: Only Doctor
router.use(authenticateToken, verifyRole(['doctor']));

// View My Appointments
router.get('/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor_id: req.user.id })
            .populate('patient_id', 'name email');

        const formatted = appointments.map(app => ({
            id: app._id,
            date: app.date,
            time: app.time,
            status: app.status,
            patient_name: app.patient_id ? app.patient_id.name : 'Unknown',
            patient_email: app.patient_id ? app.patient_id.email : 'Unknown'
        }));

        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Update Appointment Status
router.put('/appointment/:id', async (req, res) => {
    const { status } = req.body;
    try {
        const updatedAppointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, doctor_id: req.user.id },
            { status },
            { new: true } // Return the updated document
        );

        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found or not authorized' });
        }
        res.json({ message: `Appointment ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Request Leave
router.post('/leave', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { status: 'leave_requested' });
        res.json({ message: 'Leave requested' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Request Return to Work
router.post('/return-work', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { status: 'return_requested' });
        res.json({ message: 'Return to work requested' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Get My Profile (with status)
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('name email status specialization photo age');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// View Patient Profile/History (For a patient they have an appointment with or general lookup? Requirement: "doctor also see the patient profile and histroy")
router.get('/patient/:id', async (req, res) => {
    try {
        // Get patient details
        const patient = await User.findOne({ _id: req.params.id, role: 'patient' }).select('id name email');
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Get history
        const appointments = await Appointment.find({ patient_id: req.params.id })
            .populate('doctor_id', 'name');

        const history = appointments.map(app => ({
            date: app.date,
            time: app.time,
            status: app.status,
            doctor_name: app.doctor_id ? app.doctor_id.name : 'Unknown'
        }));

        res.json({ profile: patient, history });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;
