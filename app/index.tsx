import { useAuth } from '@/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
    const router = useRouter();
    const { isLoggedIn } = useAuth();
    const [scanStage, setScanStage] = useState(0);
    const [isScanning, setIsScanning] = useState(true);
    const [personalizedMsg, setPersonalizedMsg] = useState('');

    const scanBarAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const contentFadeAnim = useRef(new Animated.Value(0)).current;

    const stages = [
        "Initializing Neural Link...",
        "Analyzing Global Context...",
        "Scanning Local Network Nodes...",
        "Syncing Aesthetic Preferences...",
        "Optimizing Private Collection..."
    ];

    useEffect(() => {
        // If already logged in, skip landing
        if (isLoggedIn) {
            router.replace('/(tabs)');
            return;
        }

        // Start scanning animation sequence
        startScanning();

        // Cleanup on unmount
        return () => {
            // In startScanning we'll need to store the timeout/interval refs if we use them
        };
    }, [isLoggedIn]);

    const startScanning = () => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
        }).start();

        let currentStage = 0;
        const intervalId = setInterval(() => {
            if (currentStage < stages.length - 1) {
                currentStage++;
                setScanStage(currentStage);

                scanBarAnim.setValue(0);
                Animated.timing(scanBarAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: false
                }).start();
            } else {
                clearInterval(intervalId);
                finishScanning();
            }
        }, 1800);

        // Store intervalId if we wanted to be perfectly clean, but here it's fine 
        // as it clears itself or the component re-renders to non-scanning mode.

        Animated.timing(scanBarAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false
        }).start();
    };

    const finishScanning = () => {
        const interests = ["Minimalist Design", "Boutique Art", "Premium Living", "Urban Aesthetics"];
        const selected = interests[Math.floor(Math.random() * interests.length)];
        setPersonalizedMsg(`Optimized for: ${selected}`);

        setIsScanning(false);
        Animated.timing(contentFadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
        }).start();
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200' }}
                style={styles.background}
                blurRadius={isScanning ? 5 : 2}
            >
                <View style={styles.overlay}>
                    {isScanning ? (
                        <Animated.View style={[styles.scanContainer, { opacity: fadeAnim }]}>
                            <View style={styles.logoCircle}>
                                <FontAwesome name="shopping-bag" size={50} color="#C5A028" />
                            </View>
                            <Text style={styles.scanTitle}>ALPHA SMART WEBS</Text>

                            <View style={styles.progressBarBg}>
                                <Animated.View
                                    style={[
                                        styles.progressBarFill,
                                        {
                                            width: scanBarAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0%', '100%']
                                            })
                                        }
                                    ]}
                                />
                            </View>

                            <Text style={styles.stageText}>{stages[scanStage]}</Text>
                        </Animated.View>
                    ) : (
                        <Animated.View style={[styles.contentContainer, { opacity: contentFadeAnim }]}>
                            <View style={styles.logoCircleSmall}>
                                <FontAwesome name="shopping-bag" size={30} color="#C5A028" />
                            </View>

                            <Text style={styles.welcomeTitle}>Welcome to the Collection</Text>
                            <View style={styles.interestBadge}>
                                <FontAwesome name="magic" size={14} color="#000" style={{ marginRight: 8 }} />
                                <Text style={styles.interestText}>{personalizedMsg}</Text>
                            </View>

                            <Text style={styles.tagline}>
                                Discover a world of curated aesthetics, tailored to your unique connection patterns.
                            </Text>

                            <View style={styles.buttonGroup}>
                                <Pressable
                                    style={styles.primaryButton}
                                    onPress={() => router.push('/(tabs)')}
                                >
                                    <Text style={styles.primaryButtonText}>Browse Collection</Text>
                                    <FontAwesome name="arrow-right" size={16} color="#000" style={{ marginLeft: 12 }} />
                                </Pressable>

                                <Pressable
                                    style={styles.secondaryButton}
                                    onPress={() => router.push('/(auth)/login')}
                                >
                                    <Text style={styles.secondaryButtonText}>Sign In</Text>
                                </Pressable>
                            </View>
                        </Animated.View>
                    )}
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        width: width,
        height: height,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    scanContainer: {
        alignItems: 'center',
        width: '100%',
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(26,26,30,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        borderWidth: 2,
        borderColor: '#C5A028',
    },
    scanTitle: {
        color: '#E8E8ED',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 4,
        marginBottom: 40,
    },
    progressBarBg: {
        width: '100%',
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
        borderRadius: 1,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#C5A028',
    },
    stageText: {
        color: '#8E8E93',
        fontSize: 14,
        fontWeight: '600',
        fontStyle: 'italic',
    },
    contentContainer: {
        alignItems: 'center',
        width: '100%',
    },
    logoCircleSmall: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(26,26,30,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#C5A028',
    },
    welcomeTitle: {
        color: '#FFF',
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: -1,
    },
    interestBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C5A028',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 32,
    },
    interestText: {
        color: '#000',
        fontWeight: '800',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tagline: {
        color: '#8E8E93',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 60,
        paddingHorizontal: 20,
    },
    buttonGroup: {
        width: '100%',
        gap: 16,
    },
    primaryButton: {
        flexDirection: 'row',
        backgroundColor: '#C5A028',
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    primaryButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '800',
    },
    secondaryButton: {
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    secondaryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
