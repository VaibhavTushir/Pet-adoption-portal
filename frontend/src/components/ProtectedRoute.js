import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div className="text-center p-10 font-bold text-xl">Loading...</div>;
  }

  if (!user) {
    // Redirect them to the client login page, saving the page they were trying to access.
    return <Navigate to="/client-login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.type)) {
     // If user is logged in but tries to access a page they don't have permission for, redirect to home.
     return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};
export default ProtectedRoute;