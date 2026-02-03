const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const connectDB = require('./database');

async function seed() {
    await connectDB();

    const password = await bcrypt.hash('admin123', 10);

    // Clear existing data
    await User.deleteMany({});
    await Appointment.deleteMany({});

    // Seed Admin
    await User.create({
        name: 'Super Admin',
        email: 'admin@hms.com',
        password: password,
        role: 'admin',
        status: 'active'
    });
    console.log('Admin seeded');

    // Seed Doctor
    const doctor = await User.create({
        name: 'Dr. Sarah Smith',
        email: 'sarah@hms.com',
        password: password,
        role: 'doctor',
        specialization: 'Cardiology',
        age: 35,
        photo: 'https://via.placeholder.com/150',
        phone: '1234567890',
        status: 'active'
    });
    console.log('Doctor seeded');

    // Seed Patient
    const patient = await User.create({
        name: 'John Doe',
        email: 'john@hms.com',
        password: password,
        role: 'patient',
        status: 'active'
    });
    console.log('Patient seeded');

    // Seed Appt
    await Appointment.create({
        doctor_id: doctor._id,
        patient_id: patient._id,
        date: '2026-03-01',
        time: '10:00',
        status: 'pending'
    });
    console.log('Appointment seeded');

    console.log('Database seeded!');
    process.exit();
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
