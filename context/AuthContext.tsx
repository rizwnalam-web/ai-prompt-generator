import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';
import { getGuestTemplates, saveCustomTemplates, clearGuestTemplates } from '../services/templateService';
import { getGuestConfigs, saveConfigs, clearGuestConfigs } from '../services/apiConfigService';


interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
        setLoading(false);
    }, []);

    const handleDataMigration = (newUserId: string) => {
        const guestTemplates = getGuestTemplates();
        const guestConfigs = getGuestConfigs();

        if (guestTemplates.length > 0 || guestConfigs.length > 0) {
            if (window.confirm("We found some templates and settings from a previous session. Would you like to save them to your new account?")) {
                if (guestTemplates.length > 0) {
                    saveCustomTemplates(guestTemplates, newUserId);
                    clearGuestTemplates();
                }
                if (guestConfigs.length > 0) {
                    saveConfigs(guestConfigs, newUserId);
                    clearGuestConfigs();
                }
                 // Also migrate the active config ID
                const guestActiveId = localStorage.getItem('activeConfigId_guest');
                if (guestActiveId) {
                    localStorage.setItem(`activeConfigId_${newUserId}`, guestActiveId);
                    localStorage.removeItem('activeConfigId_guest');
                }
            } else {
                 // Clear guest data if they decline
                clearGuestTemplates();
                clearGuestConfigs();
                localStorage.removeItem('activeConfigId_guest');
            }
        }
    }

    const login = async (email: string, password: string) => {
        const user = await authService.login(email, password);
        handleDataMigration(user.id);
        setCurrentUser(user);
    };

    const register = async (email: string, password: string) => {
        const user = await authService.register(email, password);
        handleDataMigration(user.id);
        setCurrentUser(user);
    };

    const logout = () => {
        authService.logout();
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
