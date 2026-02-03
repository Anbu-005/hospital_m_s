import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

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
            <div className="header">
                <h1>Doctor Dashboard</h1>
                <button onClick={handleLogout} className="btn btn-danger">Logout</button>
            </div>

            {profile && (
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <img src={profile.photo} alt={profile.name} className="avatar" style={{ width: '100px', height: '100px' }} />
                    <div style={{ flex: 1 }}>
                        <h2>{profile.name}</h2>
                        <p>{profile.specialization}</p>
                        <div style={{ marginTop: '0.5rem' }}>
                            <span className={`status-badge status-${profile.status}`}>Current Status: {profile.status.replace('_', ' ')}</span>
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
                            <button className="btn" disabled style={{ opacity: 0.5 }}>Approval Pending</button>
                        )}
                    </div>
                </div>
            )}

            <div className="card">
                <h2>My Appointments</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(apt => (
                                <tr key={apt.id}>
                                    <td
                                        style={{ cursor: 'pointer', color: 'var(--primary)', textDecoration: 'underline' }}
                                        onClick={() => handleViewPatient(apt.patient_id)}
                                    >
                                        {apt.patient_name}
                                    </td>
                                    <td>{apt.date}</td>
                                    <td>{apt.time}</td>
                                    <td><span className={`status-${apt.status}`}>{apt.status}</span></td>
                                    <td>
                                        {apt.status === 'pending' && (
                                            <>
                                                <button className="btn btn-success" onClick={() => handleStatus(apt.id, 'completed')} style={{ marginRight: '0.5rem' }}>Complete</button>
                                                <button className="btn btn-danger" onClick={() => handleStatus(apt.id, 'rejected')}>Reject</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedPatient && (
                <div className="card">
                    <div className="header">
                        <h2>Patient History: {selectedPatient.profile.name}</h2>
                        <button className="btn" onClick={() => setSelectedPatient(null)}>Close</button>
                    </div>
                    <p><strong>Email:</strong> {selectedPatient.profile.email}</p>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Doctor</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedPatient.history.map((h, i) => (
                                    <tr key={i}>
                                        <td>{h.date}</td>
                                        <td>{h.time}</td>
                                        <td>{h.doctor_name}</td>
                                        <td>{h.status}</td>
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
