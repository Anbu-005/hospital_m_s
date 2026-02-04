import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api';

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
    const [photoPreview, setPhotoPreview] = useState(null);

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
            setPhotoPreview(null);

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
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem', borderRadius: '14px', fontWeight: 'bold' }}>HMS</div>
                    <h2 style={{ margin: 0, color: 'white' }}>Admin Control</h2>
                </div>
                <button onClick={handleLogout} className="btn btn-danger">Sign Out</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                <div className="card stat-item" style={{ borderBottom: '4px solid var(--primary)' }}>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Appointments</div>
                </div>
                <div className="card stat-item" style={{ borderBottom: '4px solid #f59e0b' }}>
                    <div className="stat-value" style={{ color: '#fbbf24' }}>{stats.pending}</div>
                    <div className="stat-label">Pending Reviews</div>
                </div>
                <div className="card stat-item" style={{ borderBottom: '4px solid var(--success)' }}>
                    <div className="stat-value" style={{ color: '#34d399' }}>{stats.completed}</div>
                    <div className="stat-label">Successful Procedures</div>
                </div>
            </div>

            <div className="section-title">
                <h2>Onboard Medical Expert</h2>
            </div>
            <div className="card" style={{ marginBottom: '4rem', padding: '2.5rem' }}>
                <form onSubmit={handleAddDoctor}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
                        {/* Section 1: Identity */}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>👤</span> Basic Information
                            </h3>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Jane Smith" required />
                            </div>
                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label className="form-label">Age</label>
                                <input className="form-control" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Years" />
                            </div>
                        </div>

                        {/* Section 2: Credentials */}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>🔑</span> Access Credentials
                            </h3>
                            <div className="form-group">
                                <label className="form-label">Gmail Address</label>
                                <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} pattern=".+@gmail\.com" placeholder="jane@gmail.com" required />
                            </div>
                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label className="form-label">Temporary Password</label>
                                <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                            </div>
                        </div>

                        {/* Section 3: Professional */}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>🩺</span> Professional Details
                            </h3>
                            <div className="form-group">
                                <label className="form-label">Specialization</label>
                                <input className="form-control" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="e.g. Cardiology" required />
                            </div>
                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label className="form-label">Contact Number</label>
                                <input className="form-control" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit number" />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'block', marginBottom: '1rem' }}>Profile Identity (Photo & Onboarding)</label>
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '20px',
                                    background: 'var(--glass-bg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--glass-border)',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}>
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '2rem', opacity: 0.2 }}>📷</span>
                                    )}
                                </div>
                                <input
                                    className="form-control"
                                    type="file"
                                    accept="image/*"
                                    style={{ padding: '0.6rem', flex: 1, minWidth: '250px' }}
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        setPhoto(file);
                                        if (file) setPhotoPreview(URL.createObjectURL(file));
                                    }}
                                />
                                <button className="btn btn-primary" type="submit" style={{ height: '54px', padding: '0 3rem', fontSize: '1rem' }}>
                                    Complete Onboarding
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div className="section-title">
                <h2>Medical Staff Registry</h2>
            </div>
            <div className="table-container" style={{ marginBottom: '4rem' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Practitioner</th>
                            <th>Contact Details</th>
                            <th>Current Status</th>
                            <th style={{ textAlign: 'right' }}>Management Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map(doc => (
                            <tr key={doc.id}>
                                <td style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <img
                                        src={getImageUrl(doc.photo)}
                                        alt={doc.name}
                                        style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover', background: 'var(--glass-bg)' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'white' }}>{doc.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{doc.specialization}</div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontSize: '0.9rem', color: 'white' }}>{doc.email}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{doc.phone || 'No phone'}</div>
                                </td>
                                <td><span className={`status-badge status-${doc.status}`}>{doc.status.replace('_', ' ').toUpperCase()}</span></td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        {doc.status === 'leave_requested' && (
                                            <button className="btn btn-primary" style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleStatusUpdate(doc.id, 'on_leave')}>Approve Leave</button>
                                        )}
                                        {doc.status === 'return_requested' && (
                                            <button className="btn btn-primary" style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleStatusUpdate(doc.id, 'active')}>Approve Return</button>
                                        )}
                                        {(doc.status.includes('requested')) && (
                                            <button className="btn btn-outline" style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem', color: '#f87171' }} onClick={() => handleStatusUpdate(doc.id, doc.status === 'leave_requested' ? 'active' : 'on_leave')}>Reject</button>
                                        )}
                                        <button className="btn btn-outline" style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }} onClick={() => handleDeleteDoctor(doc.id)}>Remove</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="section-title">
                <h2>Global Appointment Ledger</h2>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Expert</th>
                            <th>Patient</th>
                            <th>Schedule</th>
                            <th style={{ textAlign: 'right' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(apt => (
                            <tr key={apt.id}>
                                <td style={{ fontWeight: '500' }}>{apt.doctor_name}</td>
                                <td>{apt.patient_name}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{apt.date} at {apt.time}</td>
                                <td style={{ textAlign: 'right' }}><span className={`status-badge status-${apt.status}`}>{apt.status.toUpperCase()}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
