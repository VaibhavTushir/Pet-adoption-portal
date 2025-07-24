import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSession = useCallback(async () => {
        try {
            const response = await api.get('/api/auth/status');
            if (response.data.loggedIn) {
                setUser(response.data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Session check failed", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const login = async (userType, credentials) => {
        try {
            const response = await api.post(`/api/${userType}/login`, credentials);
            if (response.data.user) {
                setUser(response.data.user);
            }
            return response.data;
        } catch (err) {
            console.error('Login failed:', err.response?.data?.message);
            throw new Error(err.response?.data?.message || 'Login failed');
        }
    };

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
            setUser(null);
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const authContextValue = {
        user,
        loading,
        login,
        logout,
        checkSession,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};