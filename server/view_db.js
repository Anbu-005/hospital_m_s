const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
require('dotenv').config();

const viewDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hms');
        console.log('--- Connected to MongoDB ---\n');

        const users = await User.find({});
        console.log(`--- Users (${users.length}) ---`);
        console.log(JSON.stringify(users, null, 2));

        const appointments = await Appointment.find({});
        console.log(`\n--- Appointments (${appointments.length}) ---`);
        console.log(JSON.stringify(appointments, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
};

viewDb();
