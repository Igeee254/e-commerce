import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface UserProfile {
    email: string;
    name: string;
    role: 'User' | 'Admin';
    phone?: string;
    dateOfBirth?: string;
    altContact?: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    login: (userData: UserProfile) => void;
    logout: () => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    userEmail: string | null;
    userName: string | null;
    userRole: 'User' | 'Admin';
    userPhone: string | null;
    userDateOfBirth: string | null;
    userAltContact: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<'User' | 'Admin'>('User');
    const [userPhone, setUserPhone] = useState<string | null>(null);
    const [userDateOfBirth, setUserDateOfBirth] = useState<string | null>(null);
    const [userAltContact, setUserAltContact] = useState<string | null>(null);

    useEffect(() => {
        // Load session on mount
        const loadSession = async () => {
            try {
                const stored = await AsyncStorage.getItem('user_session');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setIsLoggedIn(true);
                    setUserEmail(parsed.email);
                    setUserName(parsed.name);
                    setUserRole(parsed.role);
                    setUserPhone(parsed.phone || null);
                    setUserDateOfBirth(parsed.dateOfBirth || null);
                    setUserAltContact(parsed.altContact || null);
                }
            } catch (e) {
                console.error('Failed to load session', e);
            }
        };
        loadSession();
    }, []);

    const login = useCallback(async (userData: UserProfile) => {
        setIsLoggedIn(true);
        setUserEmail(userData.email);
        setUserName(userData.name);
        setUserRole(userData.role);
        setUserPhone(userData.phone || null);
        setUserDateOfBirth(userData.dateOfBirth || null);
        setUserAltContact(userData.altContact || null);
        try {
            await AsyncStorage.setItem('user_session', JSON.stringify(userData));
        } catch (e) {
            console.error('Failed to save session', e);
        }
    }, []);

    const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
        try {
            const stored = await AsyncStorage.getItem('user_session');
            const current = stored ? JSON.parse(stored) : {};
            const merged = { ...current, ...updates };
            await AsyncStorage.setItem('user_session', JSON.stringify(merged));
            if (updates.name !== undefined) setUserName(updates.name);
            if (updates.phone !== undefined) setUserPhone(updates.phone);
            if (updates.dateOfBirth !== undefined) setUserDateOfBirth(updates.dateOfBirth);
            if (updates.altContact !== undefined) setUserAltContact(updates.altContact);
        } catch (e) {
            console.error('Failed to update profile', e);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoggedIn(false);
        setUserEmail(null);
        setUserName(null);
        setUserRole('User');
        setUserPhone(null);
        setUserDateOfBirth(null);
        setUserAltContact(null);
        try {
            await AsyncStorage.removeItem('user_session');
        } catch (e) {
            console.error('Failed to remove session', e);
        }
    }, []);

    const value = useMemo(() => ({
        isLoggedIn,
        login,
        logout,
        updateProfile,
        userEmail,
        userName,
        userRole,
        userPhone,
        userDateOfBirth,
        userAltContact,
    }), [isLoggedIn, login, logout, updateProfile, userEmail, userName, userRole, userPhone, userDateOfBirth, userAltContact]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
