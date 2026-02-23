import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet } from 'react-native';

interface ScrollTopButtonProps {
    scrollY: Animated.Value;
    onPress: () => void;
}

export default function ScrollTopButton({ scrollY, onPress }: ScrollTopButtonProps) {
    const colorScheme = useColorScheme();
    const currentColors = Colors[colorScheme ?? 'light'];
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const listener = scrollY.addListener(({ value }) => {
            if (value > 400 && !visible) {
                setVisible(true);
            } else if (value <= 400 && visible) {
                setVisible(false);
            }
        });

        return () => {
            scrollY.removeListener(listener);
        };
    }, [visible, scrollY]);

    if (Platform.OS !== 'web' || !visible) return null;

    return (
        <Pressable
            style={[styles.button, { backgroundColor: currentColors.tint }]}
            onPress={onPress}
        >
            <FontAwesome name="chevron-up" size={20} color="#000" />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        zIndex: 9999,
    },
});
