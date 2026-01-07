import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // Default to a logged-in Admin user for frontend-only demo
    const [user, setUser] = useState({
        _id: 'admin_123',
        name: 'Admin User',
        email: 'admin@easybooking.uz',
        role: 'admin',
        avatar: '/assets/img/team-1.jpg'
    });
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('mock_token_xyz');

    // Login just updates the state (api is already mocked to succeed)
    const login = async (email, password) => {
        const data = await authAPI.login({ email, password });
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const isAuthenticated = () => {
        return !!token && !!user;
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
