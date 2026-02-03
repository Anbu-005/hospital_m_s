import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [stats, setStats] = useState({ pending: 0, completed: 0, total: 0 });

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [age, setAge] = useState('');
    const [phone, setPhone] = useState('');
    const [photo, setPhoto] = useState(null); // File object

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/admin/appointments');
            const docRes = await api.get('/admin/doctors');
            setAppointments(res.data);
            setDoctors(docRes.data);

            // Calculate stats
            const pending = res.data.filter(a => a.status === 'pending').length;
            const completed = res.data.filter(a => a.status === 'completed').length;
            setStats({ pending, completed, total: res.data.length });
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddDoctor = async (e) => {
        e.preventDefault();

        // Use FormData for file upload
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('specialization', specialization);
        if (age) formData.append('age', age);
        if (phone) formData.append('phone', phone);
        if (photo) formData.append('photo', photo);

        try {
            await api.post('/admin/doctor', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Doctor added successfully');

            // Reset form
            setName('');
            setEmail('');
            setPassword('');
            setSpecialization('');
            setAge('');
            setPhone('');
            setPhoto(null);

            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add doctor');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/admin/doctor/${id}/status`, { status });
            fetchData();
        } catch (err) {
            alert('Update failed');
        }
    };

    const handleDeleteDoctor = async (id) => {
        if (!confirm('Are you sure you want to delete this doctor?')) return;
        try {
            await api.delete(`/admin/doctor/${id}`);
            fetchData();
        } catch (err) {
            alert('Delete failed');
        }
    };

    return (
        <div className="container">
            <div className="header">
                <h1>Admin Dashboard</h1>
                <button onClick={handleLogout} className="btn btn-danger">Logout</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3>Total Appointments</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total}</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3>Pending</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d97706' }}>{stats.pending}</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3>Completed</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats.completed}</p>
                </div>
            </div>

            <div className="card">
                <h2>Add New Doctor</h2>
                <form onSubmit={handleAddDoctor} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label className="form-label">Name</label>
                        <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="form-label">Email</label>
                        <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} pattern=".+@gmail\.com" title="Please provide a valid @gmail.com address" required />
                    </div>
                    <div>
                        <label className="form-label">Password</label>
                        <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div>
                        <label className="form-label">Specialization</label>
                        <input className="form-control" value={specialization} onChange={e => setSpecialization(e.target.value)} required />
                    </div>
                    <div>
                        <label className="form-label">Age</label>
                        <input className="form-control" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Optional" />
                    </div>
                    <div>
                        <label className="form-label">Phone Number</label>
                        <input className="form-control" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Optional" />
                    </div>
                    <div>
                        <label className="form-label">Photo (Upload)</label>
                        <input
                            className="form-control"
                            type="file"
                            accept="image/*"
                            onChange={e => setPhoto(e.target.files[0])}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'end' }}>
                        <button className="btn btn-primary" type="submit">Add Doctor</button>
                    </div>
                </form>
            </div>

            <div className="card">
                <h2>Doctors List</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Doctor</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map(doc => (
                                <tr key={doc.id}>
                                    <td style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <img src={doc.photo} alt="" className="avatar" style={{ width: '50px', height: '50px' }} />
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{doc.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{doc.specialization}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem' }}>{doc.email}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{doc.phone || 'No phone'}</div>
                                    </td>
                                    <td><span className={`status-badge status-${doc.status}`}>{doc.status.replace('_', ' ')}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {doc.status === 'leave_requested' && (
                                                <button className="btn btn-success" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleStatusUpdate(doc.id, 'on_leave')}>Approve Leave</button>
                                            )}
                                            {doc.status === 'return_requested' && (
                                                <button className="btn btn-success" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleStatusUpdate(doc.id, 'active')}>Approve Return</button>
                                            )}
                                            {(doc.status.includes('requested')) && (
                                                <button className="btn btn-danger" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleStatusUpdate(doc.id, doc.status === 'leave_requested' ? 'active' : 'on_leave')}>Reject</button>
                                            )}
                                            <button className="btn btn-danger" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleDeleteDoctor(doc.id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Appointments Table (Optional: could be a separate component or collapsible) */}
            <div className="card">
                <h2>All Appointments</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Doctor</th>
                                <th>Patient</th>
                                <th>Date/Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(apt => (
                                <tr key={apt.id}>
                                    <td>{apt.doctor_name}</td>
                                    <td>{apt.patient_name}</td>
                                    <td>{apt.date} at {apt.time}</td>
                                    <td><span className={`status-badge status-${apt.status}`}>{apt.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
