import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="text-center bg-white p-12 rounded-lg shadow-xl mt-10">
            <h1 className="text-5xl font-bold mb-4 text-gray-800">Find Your New Best Friend</h1>
            <p className="text-xl text-gray-600 mb-8">
                Browse pets from our network of shelters and find your perfect companion.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/client-register" className="inline-block w-full sm:w-auto btn btn-primary text-lg px-8 py-3">
                    Get Started
                </Link>
                <Link to="/client-dashboard" className="inline-block w-full sm:w-auto btn btn-secondary text-lg px-8 py-3">
                    View Available Pets
                </Link>
            </div>
        </div>
    );
};
export default Home;