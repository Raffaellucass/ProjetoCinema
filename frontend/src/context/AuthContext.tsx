import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../utils/api';

interface User {
    id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string, role: 'user' | 'admin') => Promise<void>;
    register: (username: string, email: string, password: string, confirmPassword: string, role: 'user' | 'admin') => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Carregar usuário ao iniciar a aplicação
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                    // Validar token no backend
                    await api.get('/api/auth/me');
                } catch (error) {
                    // Token inválido, limpar
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = async (email: string, password: string, role: 'user' | 'admin') => {
        try {
            const response = await api.post('/api/auth/login', { email, password, role });
            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error: any) {
            if (!error.response) {
                throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão ou se o backend está online.');
            }
            throw new Error(error.response?.data?.message || 'Erro ao fazer login');
        }
    };

    const register = async (
        username: string,
        email: string,
        password: string,
        confirmPassword: string,
        role: 'user' | 'admin'
    ) => {
        try {
            const response = await api.post('/api/auth/register', {
                username,
                email,
                password,
                confirmPassword,
                role
            });
            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error: any) {
            if (!error.response) {
                throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão ou se o backend está online.');
            }
            throw new Error(error.response?.data?.message || 'Erro ao registrar');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
