import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('name', res.data.name);

            if (res.data.role === 'admin') navigate('/admin');
            else if (res.data.role === 'doctor') navigate('/doctor');
            else navigate('/patient');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box card" style={{ padding: '3rem', maxWidth: '420px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', display: 'inline-block', padding: '1rem', borderRadius: '18px', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem', boxShadow: 'var(--shadow-lg)' }}>HMS</div>
                    <h2 style={{ fontSize: '2rem', margin: 0, color: 'white' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Please enter your credentials to continue</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="name@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                        Sign In
                    </button>
                    <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        New to HMS? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Create an account</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
