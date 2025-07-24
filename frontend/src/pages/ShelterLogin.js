import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ShelterLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login('shelter', { email, password });
            navigate('/shelter-dashboard');
        } catch (err) {
            setError(err.message || 'Failed to login. Please check your credentials.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Shelter Login</h2>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>}
                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required />
                </div>
                <button type="submit" className="w-full btn btn-primary">Login</button>
                <p className="text-center mt-4 text-sm">
                    Don't have a shelter account? <Link to="/shelter-register" className="text-blue-600 hover:underline">Register here</Link>
                </p>
            </form>
        </div>
    );
};
export default ShelterLogin;