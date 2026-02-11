require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(cors());

// Ensure Uploads Directory Exists (Crucial for Render/Deployment)
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

// Serve Static Uploads
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/patient', require('./routes/patient'));

// Serve Frontend in Production
const publicPath = path.join(__dirname, 'public');
if (require('fs').existsSync(publicPath)) {
    app.use(express.static(publicPath));
    // Catch-all for SPA
    app.get('*', (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
    });
} else {
    // If no public folder, return a simple status for the root URL
    app.get('/', (req, res) => {
        res.send('HMS Backend API is running...');
    });
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
