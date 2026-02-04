const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
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

    // Photo URL construction (relative path for portability)
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newDoctor = new User({
            name,
            email,
            password: hashedPassword,
            role: 'doctor',
            specialization,
            age: age || null,
            photo: photoUrl,
            phone: phone || null,
            status: 'active'
        });

        await newDoctor.save();
        res.status(201).json({ message: 'Doctor added successfully' });
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Doctors
router.get('/doctors', async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('-password');
        // Retrieve virtual 'id'
        const doctorsWithId = doctors.map(doc => ({
            ...doc.toObject(),
            id: doc._id
        }));
        res.json(doctorsWithId);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Delete Doctor
router.delete('/doctor/:id', async (req, res) => {
    try {
        await User.findOneAndDelete({ _id: req.params.id, role: 'doctor' });
        res.json({ message: 'Doctor deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Update Doctor Status
router.put('/doctor/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await User.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: 'Status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// View All Appointments
router.get('/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('doctor_id', 'name')
            .populate('patient_id', 'name');

        const formatted = appointments.map(app => ({
            id: app._id,
            date: app.date,
            time: app.time,
            status: app.status,
            doctor_name: app.doctor_id ? app.doctor_id.name : 'Unknown',
            patient_name: app.patient_id ? app.patient_id.name : 'Unknown'
        }));

        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

// View All Patients (simplified fetch)
router.get('/patients', async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' }).select('name email');
        const formatted = patients.map(p => ({
            id: p._id,
            name: p.name,
            email: p.email
        }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;
