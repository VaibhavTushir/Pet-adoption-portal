import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="text-center py-20">
            <h1 className="text-9xl font-bold text-blue-400">404</h1>
            <p className="text-2xl mt-4 font-semibold text-gray-700">Page Not Found</p>
            <p className="text-gray-500 mt-2">Sorry, the page you are looking for does not exist.</p>
            <Link to="/" className="mt-6 inline-block btn btn-primary">
                Go to Homepage
            </Link>
        </div>
    );
};
export default NotFound;