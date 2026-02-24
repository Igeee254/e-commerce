import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
    themePreference: ThemePreference;
    setThemePreference: (theme: ThemePreference) => Promise<void>;
    colorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'user-theme-preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const deviceColorScheme = useDeviceColorScheme();
    const [themePreference, setThemePreferenceState] = useState<ThemePreference>('dark'); // Force dark default

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                console.log('ThemeContext: Loaded from storage:', savedTheme);
                if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
                    setThemePreferenceState(savedTheme);
                }
            } catch (error) {
                console.error('Failed to load theme preference:', error);
            }
        };
        loadTheme();
    }, []);

    const setThemePreference = async (theme: ThemePreference) => {
        try {
            console.log('ThemeContext: Setting theme preference to:', theme);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
            setThemePreferenceState(theme);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    const activeColorScheme = themePreference === 'system'
        ? (deviceColorScheme ?? 'dark') // Default system to dark if unknown on web
        : themePreference;

    return (
        <ThemeContext.Provider value={{ themePreference, setThemePreference, colorScheme: activeColorScheme as 'light' | 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
