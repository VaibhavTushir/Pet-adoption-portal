import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
    const [data, setData] = useState({ clients: [], shelters: [] });
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/api/admin/dashboard');
                setData(response.data);
            } catch (err) {
                setError('Failed to fetch dashboard data.');
            }
        };
        if (user) {
            fetchData();
        }
    }, [user]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Clients Table */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Clients</h2>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.clients.map(client => (
                                    <tr key={client.client_id} className="border-b">
                                        <td className="p-2">{client.client_name}</td>
                                        <td className="p-2">{client.client_email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Shelters Table */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Shelters</h2>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.shelters.map(shelter => (
                                    <tr key={shelter.shelter_id} className="border-b">
                                        <td className="p-2">{shelter.shelter_name}</td>
                                        <td className="p-2">{shelter.shelter_email}</td>
                                        <td className="p-2">{shelter.shelter_address}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;