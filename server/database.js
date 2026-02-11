const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hms';

        // Log a masked version for debugging in Render
        const maskedUri = uri.replace(/\/\/.*@/, '//****:****@');
        console.log('Connecting to MongoDB:', maskedUri);

        await mongoose.connect(uri);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
