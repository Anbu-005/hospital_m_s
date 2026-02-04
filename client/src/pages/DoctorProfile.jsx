import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api';

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
            const res = await api.get(`/patient/doctors/${id}`);
            setDoctor(res.data);
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
            <div className="header" style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem', borderRadius: '14px', fontWeight: 'bold' }}>HMS</div>
                    <h2 style={{ margin: 0, color: 'white' }}>Expert Profile</h2>
                </div>
                <button onClick={() => navigate('/patient')} className="btn btn-outline">Back to Dashboard</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', marginTop: '2rem' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <img
                        src={getImageUrl(doctor.photo)}
                        alt={doctor.name}
                        className="doctor-card-img"
                        style={{ height: '350px' }}
                    />
                    <h2 style={{ marginBottom: '0.5rem', color: 'white' }}>{doctor.name}</h2>
                    <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1.5rem' }}>{doctor.specialization}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                        <span className={`status-badge status-${doctor.status}`}>
                            {doctor.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', width: '100%', border: '1px solid var(--glass-border)' }}>
                            <p style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)' }}><strong>Email:</strong> {doctor.email}</p>
                            {doctor.phone && <p style={{ margin: 0, color: 'var(--text-muted)' }}><strong>Phone:</strong> {doctor.phone}</p>}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="card" style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Professional Overview</h3>
                        <p style={{ lineHeight: '1.8', color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                            A distinguished specialist in {doctor.specialization}.
                            Committed to delivering world-class medical services through innovative treatments and empathetic patient engagement.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                            <div className="stat-item">
                                <div className="stat-value">{doctor.age || '35'}</div>
                                <div className="stat-label">Years Old</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">{doctor.experience_count || 0}</div>
                                <div className="stat-label">Successful Cases</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">4.9</div>
                                <div className="stat-label">Patient Rating</div>
                            </div>
                        </div>
                    </div>

                    {doctor.status === 'active' ? (
                        <div className="card" style={{ border: '1px solid var(--primary)' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Reserve Appointment</h3>
                            <form onSubmit={handleBook} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1.5rem', alignItems: 'end' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Preferred Date</label>
                                    <input className="form-control" type="date" onChange={e => setBookingDate(e.target.value)} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Preferred Time</label>
                                    <input className="form-control" type="time" onChange={e => setBookingTime(e.target.value)} required />
                                </div>
                                <button className="btn btn-primary" type="submit" style={{ height: '50px' }}>Confirm Reservation</button>
                            </form>
                        </div>
                    ) : (
                        <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <h3 style={{ color: '#f87171' }}>Currently Unavailable</h3>
                            <p style={{ color: 'var(--text-muted)' }}>This specialist is currently off-duty. Please select another doctor or check back later.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
