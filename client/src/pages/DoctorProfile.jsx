import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const DoctorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');

    useEffect(() => {
        fetchDoctor();
    }, []);

    const fetchDoctor = async () => {
        try {
            console.log("Fetching doctors for profile view...");
            const res = await api.get('/patient/doctors');
            console.log("Doctors found:", res.data);
            console.log("Searching for ID:", id);

            // Loose equality (==) to handle string/number mismatch
            const doc = res.data.find(d => d.id == id);

            if (!doc) {
                console.error("Doctor ID not found in list");
                alert('Doctor not found');
                navigate('/patient');
                return;
            }
            setDoctor(doc);
        } catch (err) {
            console.error("Error fetching doctor:", err);
            alert('Failed to load doctor details');
            navigate('/patient');
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            await api.post('/patient/book', {
                doctor_id: doctor.id,
                date: bookingDate,
                time: bookingTime
            });
            alert('Appointment booked successfully!');
            navigate('/patient');
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        }
    };

    if (!doctor) return (
        <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
            <div className="card">
                <h2>Loading Profile...</h2>
            </div>
        </div>
    );

    return (
        <div className="container">
            <div className="navbar">
                <div className="logo">HMS Premium</div>
                <button onClick={() => navigate('/patient')} className="btn btn-outline">Back to Dashboard</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', alignItems: 'start' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <img
                        src={doctor.photo}
                        alt={doctor.name}
                        style={{ width: '100%', borderRadius: '12px', marginBottom: '1.5rem', objectFit: 'cover', height: '300px' }}
                    />
                    <h2>{doctor.name}</h2>
                    <p style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.1rem' }}>{doctor.specialization}</p>
                    <div style={{ margin: '1rem 0' }}>
                        <span className={`status-badge status-${doctor.status}`}>{doctor.status.replace('_', ' ')}</span>
                    </div>
                </div>

                <div>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h3>About {doctor.name}</h3>
                        <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                            A highly experienced specialist in {doctor.specialization} medicine.
                            Dedicated to providing top-tier patient care with over {doctor.experience_count || 0} successful surgeries and consultations.
                        </p>

                        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '2rem' }}>{doctor.age || 'N/A'}</h4>
                                <small>Years Old</small>
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '2rem' }}>{doctor.experience_count}</h4>
                                <small>Successful Procedures</small>
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '2rem' }}>4.9</h4>
                                <small>Patient Rating</small>
                            </div>
                        </div>
                    </div>

                    {doctor.status === 'active' ? (
                        <div className="card">
                            <h3>Book Appointment</h3>
                            <form onSubmit={handleBook} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                                <div>
                                    <label className="form-label">Date</label>
                                    <input className="form-control" type="date" onChange={e => setBookingDate(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="form-label">Time</label>
                                    <input className="form-control" type="time" onChange={e => setBookingTime(e.target.value)} required />
                                </div>
                                <button className="btn btn-primary" type="submit">Confirm Booking</button>
                            </form>
                        </div>
                    ) : (
                        <div className="card" style={{ background: 'rgba(127, 29, 29, 0.2)', border: '1px solid #7f1d1d' }}>
                            <h3 style={{ color: '#fca5a5' }}>Doctor Currently Unavailable</h3>
                            <p style={{ color: '#fca5a5' }}>This doctor is currently on leave. Please check back later or choose another specialist.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
