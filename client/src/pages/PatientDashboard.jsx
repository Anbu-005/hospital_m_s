import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [history, setHistory] = useState([]);
    const [booking, setBooking] = useState({ doctor_id: null, date: '', time: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const docs = await api.get('/patient/doctors');
            const hist = await api.get('/patient/history');
            setDoctors(docs.data);
            setHistory(hist.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            await api.post('/patient/book', booking);
            alert('Appointment booked successfully!');
            setBooking({ doctor_id: null, date: '', time: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="container">
            <div className="header">
                <h1>Patient Dashboard</h1>
                <button onClick={handleLogout} className="btn btn-danger">Logout</button>
            </div>

            <div className="card">
                <h2>Book Appointment</h2>
                <div className="doctor-card-grid">
                    {doctors.map(doc => (
                        <div key={doc.id} className="card doctor-card">
                            {doc.status === 'on_leave' && (
                                <div className="unavailable-overlay">Doctor Unavailable</div>
                            )}
                            <img src={doc.photo} alt={doc.name} className="avatar" style={{ width: '100px', height: '100px', margin: '0 auto 1rem' }} />
                            <h3>{doc.name}</h3>
                            <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{doc.specialization}</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '1rem 0', color: 'var(--text-muted)' }}>
                                <span>{doc.age || '35'} Years Old</span>
                                <span>•</span>
                                <span>{doc.experience_count} Surgeries</span>
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={() => navigate(`/patient/doctor/${doc.id}`)}
                                style={{ width: '100%' }}
                            >
                                View Profile & Book
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {booking.doctor_id && (
                <div className="card" style={{ border: '2px solid var(--primary)' }}>
                    <h3>Complete Booking</h3>
                    <form onSubmit={handleBook}>
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input
                                className="form-control"
                                type="date"
                                value={booking.date}
                                onChange={e => setBooking({ ...booking, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Time</label>
                            <input
                                className="form-control"
                                type="time"
                                value={booking.time}
                                onChange={e => setBooking({ ...booking, time: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" type="submit">Confirm Booking</button>
                            <button
                                className="btn"
                                type="button"
                                onClick={() => setBooking({ doctor_id: null, date: '', time: '' })}
                                style={{ backgroundColor: '#e5e7eb' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <h2>My Appointment History</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Doctor</th>
                                <th>Specialization</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(h => (
                                <tr key={h.id}>
                                    <td>{h.doctor_name}</td>
                                    <td>{h.specialization}</td>
                                    <td>{h.date}</td>
                                    <td>{h.time}</td>
                                    <td><span className={`status-${h.status}`}>{h.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
