const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./database');

async function checkUsers() {
    await connectDB();
    const users = await User.find({}, 'name email role');
    console.log(JSON.stringify(users, null, 2));
    process.exit();
}

checkUsers();
