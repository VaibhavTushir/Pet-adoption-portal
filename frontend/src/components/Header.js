import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          {/* Using the image from the backend's public folder */}
          <img src="http://localhost:3001/images/logo.png" alt="Pawsitive Match" className="h-10 w-auto"/>
          <span className="text-2xl font-bold text-gray-800">Pawsitive Match</span>
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-700 hidden sm:block">Welcome, {user.name}!</span>
              {user.type === 'client' && <Link to="/client-dashboard" className="text-blue-600 hover:underline">Dashboard</Link>}
              {user.type === 'shelter' && <Link to="/shelter-dashboard" className="text-blue-600 hover:underline">Dashboard</Link>}
              {user.type === 'admin' && <Link to="/admin-dashboard" className="text-blue-600 hover:underline">Dashboard</Link>}
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </>
          ) : (
            <div className="hidden sm:flex items-center space-x-4">
              <Link to="/client-login" className="text-blue-600 hover:underline">Client Login</Link>
              <Link to="/shelter-login" className="text-blue-600 hover:underline">Shelter Login</Link>
              <Link to="/admin-login" className="text-blue-600 hover:underline">Admin Login</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
export default Header;