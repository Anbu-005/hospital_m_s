import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [history, setHistory] = useState([]);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [booking, setBooking] = useState({ doctor_id: null, date: '', time: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setError(null);
            const [docsRes, histRes, profRes] = await Promise.all([
                api.get('/patient/doctors'),
                api.get('/patient/history'),
                api.get('/patient/profile')
            ]);
            setDoctors(docsRes.data);
            setHistory(histRes.data);
            setProfile(profRes.data);
        } catch (err) {
            console.error("Fetch Data Error:", err);
            setError(err.response?.data?.message || err.message || 'Failed to connect to server');
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

    const handleDownloadReceipt = (appointment) => {
        const receiptText = `
-----------------------------------------
         HOSPITAL MANAGEMENT SYSTEM
              APPOINTMENT RECEIPT
-----------------------------------------
Patient Name: ${profile?.name}
Patient Email: ${profile?.email}
-----------------------------------------
Doctor: ${appointment.doctor_name}
Specialization: ${appointment.specialization}
Date: ${appointment.date}
Time: ${appointment.time}
Status: ${appointment.status.toUpperCase()}
-----------------------------------------
Note: Please bring this receipt with you 
at the time of appointment.
-----------------------------------------
Generated on: ${new Date().toLocaleString()}
`;
        const blob = new Blob([receiptText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Receipt_${appointment.id}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="container">
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem', borderRadius: '14px', fontWeight: 'bold' }}>HMS</div>
                    <h2 style={{ margin: 0, color: 'white' }}>Premium Portal</h2>
                </div>
                <button onClick={handleLogout} className="btn btn-danger">Sign Out</button>
            </div>

            {error && (
                <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>⚠️</span>
                        <p style={{ margin: 0 }}><strong>Transmission Error:</strong> {error}</p>
                    </div>
                    <button className="btn btn-outline" onClick={fetchData} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Reinitialize Connection</button>
                </div>
            )}

            {profile && (
                <div className="card profile-hero">
                    <div className="profile-avatar-large">
                        {profile.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ marginBottom: '0.5rem', color: 'white' }}>Welcome back, {profile.name}</h1>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                                <span style={{ color: 'var(--primary)' }}>●</span> Patient ID: {profile._id.slice(-6).toUpperCase()}
                            </p>
                            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                                <span style={{ color: 'var(--success)' }}>●</span> {profile.email}
                            </p>
                            {profile.phone && (
                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                                    <span style={{ color: 'var(--primary)' }}>●</span> {profile.phone}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="section-title">
                <h2>Browse Specialists</h2>
            </div>

            <div className="doctor-card-grid" style={{ marginBottom: '4rem' }}>
                {doctors.map(doc => (
                    <div key={doc.id} className="card doctor-card">
                        {doc.status === 'on_leave' && (
                            <div className="unavailable-overlay">On Leave</div>
                        )}
                        <img src={getImageUrl(doc.photo)} alt={doc.name} className="doctor-card-img" />
                        <h3 style={{ marginBottom: '0.2rem' }}>{doc.name}</h3>
                        <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '1rem' }}>{doc.specialization}</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <div className="stat-item" style={{ padding: '0.75rem' }}>
                                <div className="stat-value" style={{ fontSize: '1.2rem' }}>{doc.age || '35'}</div>
                                <div className="stat-label">Years</div>
                            </div>
                            <div className="stat-item" style={{ padding: '0.75rem' }}>
                                <div className="stat-value" style={{ fontSize: '1.2rem' }}>{doc.experience_count}</div>
                                <div className="stat-label">Cases</div>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/patient/doctor/${doc.id}`)}
                            style={{ width: '100%' }}
                        >
                            View & Book
                        </button>
                    </div>
                ))}
            </div>

            <div className="section-title">
                <h2>Clinical History</h2>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Medical Expert</th>
                            <th>Specialization</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Outcome</th>
                            <th style={{ textAlign: 'right' }}>Documentation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length > 0 ? history.map(h => (
                            <tr key={h.id}>
                                <td style={{ fontWeight: '600' }}>{h.doctor_name}</td>
                                <td>{h.specialization}</td>
                                <td>{h.date}</td>
                                <td>{h.time}</td>
                                <td><span className={`status-badge status-${h.status}`}>{h.status}</span></td>
                                <td style={{ textAlign: 'right' }}>
                                    <button
                                        className="btn btn-outline"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                        onClick={() => handleDownloadReceipt(h)}
                                    >
                                        Download Receipt
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No appointment records found in our systems.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientDashboard;
