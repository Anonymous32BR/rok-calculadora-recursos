import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check session storage on mount
        const storedAuth = sessionStorage.getItem('rok_leadership_auth');
        if (storedAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const login = (username, password) => {
        // Hardcoded credentials as requested
        if (username === 'adm1032' && password === 'adm#1032#adm') {
            sessionStorage.setItem('rok_leadership_auth', 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        sessionStorage.removeItem('rok_leadership_auth');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
