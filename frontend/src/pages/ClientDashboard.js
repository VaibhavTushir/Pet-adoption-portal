import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ClientDashboard = () => {
    const [pets, setPets] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const { user } = useContext(AuthContext);

    const fetchPets = async () => {
        try {
            const response = await api.get('/api/pets');
            setPets(response.data);
        } catch (err) {
            setError('Failed to fetch pets. You might need to log in again.');
        }
    };

    useEffect(() => {
        if (user) {
            fetchPets();
        }
    }, [user]);

    const handleAdopt = async (pet_id) => {
        setError('');
        setMessage('');
        if (!window.confirm("Are you sure you want to request this adoption? A shelter representative will review your request.")) return;
        try {
            const response = await api.post('/api/pets/adopt', { pet_id });
            setMessage(response.data.message);
            fetchPets(); // Refresh the list of pets after adoption
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to adopt pet.');
        }
    };

    // Construct the full URL for the pet's image
    const getImageUrl = (imagePath) => {
        if (!imagePath) {
            // Return a placeholder image if no image is provided
            return `https://placehold.co/600x400/E2E8F0/4A5568?text=No+Image`;
        }
        // Assumes images are in a folder served by the backend, e.g., 'public/uploads/'
        return `http://localhost:3001/${imagePath}`;
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}! Find a Pet to Adopt</h1>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
            {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pets.length > 0 ? pets.map(pet => (
                    <div key={pet.pet_id} className="card flex flex-col transition-transform transform hover:-translate-y-1">
                        {/* Image section */}
                        <img 
                            src={getImageUrl(pet.pet_image)} 
                            alt={pet.pet_name} 
                            className="w-full h-48 object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/E2E8F0/4A5568?text=No+Image'; }}
                        />
                        <div className="p-6 flex-grow flex flex-col">
                            <h2 className="text-2xl font-bold">{pet.pet_name}</h2>
                            <p className="text-gray-600">{pet.pet_breed} ({pet.pet_type})</p>
                            <p className="text-gray-500">Age: {pet.pet_age}</p>
                            <p className="text-gray-700 font-semibold mt-2">Shelter: {pet.shelter_name}</p>
                            <div className="mt-auto pt-4">
                                <button onClick={() => handleAdopt(pet.pet_id)} className="w-full btn btn-primary">Request to Adopt</button>
                            </div>
                        </div>
                    </div>
                )) : <p className="col-span-full text-center text-gray-500 mt-10">No pets available for adoption at the moment. Check back soon!</p>}
            </div>
        </div>
    );
};
export default ClientDashboard;
