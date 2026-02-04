import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [profile, setProfile] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        fetchAppointments();
        fetchProfile();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/doctor/appointments');
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await api.get('/doctor/profile');
            setProfile(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLeaveRequest = async () => {
        if (!confirm('Are you sure you want to request leave?')) return;
        try {
            await api.post('/doctor/leave');
            fetchProfile();
            alert('Leave requested. Waiting for admin approval.');
        } catch (err) {
            alert('Request failed');
        }
    };

    const handleReturnRequest = async () => {
        try {
            await api.post('/doctor/return-work');
            fetchProfile();
            alert('Return request sent.');
        } catch (err) {
            alert('Request failed');
        }
    };

    const handleStatus = async (id, status) => {
        try {
            await api.put(`/doctor/appointment/${id}`, { status });
            fetchAppointments();
        } catch (err) {
            console.error(err);
            alert('Action failed');
        }
    };

    const handleViewPatient = async (id) => {
        try {
            const res = await api.get(`/doctor/patient/${id}`);
            setSelectedPatient(res.data);
        } catch (err) {
            alert('Could not fetch patient details');
        }
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
                    <h2 style={{ margin: 0, color: 'white' }}>Doctor Center</h2>
                </div>
                <button onClick={handleLogout} className="btn btn-danger">Sign Out</button>
            </div>

            {profile && (
                <div className="card profile-hero" style={{ padding: '2.5rem' }}>
                    <img src={getImageUrl(profile.photo)} alt={profile.name} className="profile-avatar-large" style={{ borderRadius: '24px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                        <h1 style={{ marginBottom: '0.5rem', color: 'white' }}>Dr. {profile.name}</h1>
                        <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '1.2rem', margin: '0 0 1rem' }}>{profile.specialization}</p>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <span className={`status-badge status-${profile.status}`}>
                                {profile.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>● {profile.email}</span>
                        </div>
                    </div>
                    <div>
                        {profile.status === 'active' && (
                            <button className="btn btn-danger" onClick={handleLeaveRequest}>Request Leave</button>
                        )}
                        {profile.status === 'on_leave' && (
                            <button className="btn btn-success" onClick={handleReturnRequest}>Request Return to Work</button>
                        )}
                        {profile.status.includes('requested') && (
                            <button className="btn btn-outline" disabled style={{ opacity: 0.7, cursor: 'not-allowed' }}>Approval Pending</button>
                        )}
                    </div>
                </div>
            )}

            <div className="section-title">
                <h2>Assigned Appointments</h2>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Patient Name</th>
                                <th>Scheduled Date</th>
                                <th>Time Slot</th>
                                <th>Current Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.length > 0 ? appointments.map(apt => (
                                <tr key={apt.id}>
                                    <td
                                        style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }}
                                        onClick={() => handleViewPatient(apt.patient_id)}
                                    >
                                        {apt.patient_name}
                                    </td>
                                    <td>{apt.date}</td>
                                    <td>{apt.time}</td>
                                    <td><span className={`status-badge status-${apt.status}`}>{apt.status}</span></td>
                                    <td style={{ textAlign: 'right' }}>
                                        {apt.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button className="btn btn-primary" onClick={() => handleStatus(apt.id, 'completed')} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Complete</button>
                                                <button className="btn btn-outline" onClick={() => handleStatus(apt.id, 'rejected')} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)' }}>Reject</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No appointments scheduled at this time.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedPatient && (
                <div className="card" style={{ marginTop: '3rem', border: '1px solid var(--primary)' }}>
                    <div className="header" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', margin: 0 }}>Clinical Record: {selectedPatient.profile.name}</h2>
                        <button className="btn btn-outline" onClick={() => setSelectedPatient(null)}>Close Record</button>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}><strong>Patient Contact:</strong> {selectedPatient.profile.email}</p>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Service Date</th>
                                    <th>Session Time</th>
                                    <th>Attending Physician</th>
                                    <th>Medical Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedPatient.history.map((h, i) => (
                                    <tr key={i}>
                                        <td>{h.date}</td>
                                        <td>{h.time}</td>
                                        <td style={{ fontWeight: '500' }}>{h.doctor_name}</td>
                                        <td><span className={`status-badge status-${h.status}`}>{h.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
