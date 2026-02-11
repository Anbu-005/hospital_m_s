require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

console.log('--- MongoDB Diagnostic ---');
console.log('URI found in env:', uri ? uri.split('@')[1] : 'NOT FOUND'); // Log only host for safety
console.log('Attempting to connect...');

if (!uri) {
    console.error('Error: MONGO_URI is not defined in environment variables.');
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => {
        console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ FAILURE: Connection failed.');
        console.error('Error Message:', err.message);

        if (err.message.includes('authentication failed')) {
            console.log('\nPossible causes for "bad auth":');
            console.log('1. The password in your MONGO_URI is incorrect.');
            console.log('2. The database user "viswaanbu123_db_user" does not exist in Atlas.');
            console.log('3. The user does not have enough permissions (e.g., Read/Write).');
        }
        process.exit(1);
    });
