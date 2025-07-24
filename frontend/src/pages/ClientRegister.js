import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ClientRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const response = await api.post('/api/client/register', { name, email, password });
            setMessage(response.data.message + ' Redirecting to login...');
            setTimeout(() => navigate('/client-login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Client Registration</h2>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>}
                {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</p>}
                <div className="mb-4">
                    <label className="block text-gray-700">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required />
                </div>
                <button type="submit" className="w-full btn btn-primary">Register</button>
                 <p className="text-center mt-4 text-sm">
                    Already have an account? <Link to="/client-login" className="text-blue-600 hover:underline">Login here</Link>
                </p>
            </form>
        </div>
    );
};
export default ClientRegister;