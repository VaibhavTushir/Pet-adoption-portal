import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ShelterDashboard = () => {
    const { user } = useContext(AuthContext);
    const [pets, setPets] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Form state
    const [petName, setPetName] = useState('');
    const [petType, setPetType] = useState('');
    const [petBreed, setPetBreed] = useState('');
    const [petAge, setPetAge] = useState('');

    const fetchShelterPets = async () => {
        try {
            const response = await api.get('/api/shelter/pets');
            setPets(response.data);
        } catch (err) {
            setError('Failed to fetch your pets.');
        }
    };

    useEffect(() => {
        if (user) {
            fetchShelterPets();
        }
    }, [user]);

    const handleAddPet = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const response = await api.post('/api/pets/add', {
                name: petName,
                type: petType,
                breed: petBreed,
                age: petAge,
            });
            setMessage(response.data.message);
            // Clear form and refresh pet list
            setPetName('');
            setPetType('');
            setPetBreed('');
            setPetAge('');
            fetchShelterPets();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add pet.');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold mb-4">Add a New Pet</h2>
                <form onSubmit={handleAddPet} className="bg-white p-6 rounded-lg shadow-md">
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>}
                    {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700">Pet Name</label>
                        <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} className="form-input" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Pet Type (e.g., Dog, Cat)</label>
                        <input type="text" value={petType} onChange={(e) => setPetType(e.target.value)} className="form-input" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Breed</label>
                        <input type="text" value={petBreed} onChange={(e) => setPetBreed(e.target.value)} className="form-input" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Age</label>
                        <input type="number" value={petAge} onChange={(e) => setPetAge(e.target.value)} className="form-input" required />
                    </div>
                    <button type="submit" className="w-full btn btn-primary">Add Pet</button>
                </form>
            </div>
            <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold mb-6">Your Shelter's Pets</h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {pets.length > 0 ? (
                        <ul className="space-y-4">
                            {pets.map(pet => (
                                <li key={pet.pet_id} className="p-4 border rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg">{pet.pet_name}</p>
                                        <p className="text-sm text-gray-600">{pet.pet_breed}, Age: {pet.pet_age}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-sm rounded-full ${pet.adoption_status ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                                        {pet.adoption_status ? 'Adopted' : 'Available'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>You have not added any pets yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ShelterDashboard;