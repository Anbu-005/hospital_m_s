const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'completed', 'cancelled', 'rejected']
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
