import { useColorScheme } from '@/components/useColorScheme';
import { API_BASE_URL } from '@/constants/API';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const PAYMENT_METHODS = [
    { id: 'mpesa', name: 'M-Pesa', icon: 'mobile', description: 'Fast and secure mobile payment' },
    { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card', description: 'Visa, Mastercard, American Express' },
    { id: 'bank', name: 'Bank Transfer', icon: 'bank', description: 'Direct transfer from your bank account' },
];

export default function PaymentOptionsScreen() {
    const colorScheme = useColorScheme();
    const currentColors = Colors[colorScheme ?? 'light'];
    const [selectedId, setSelectedId] = useState('mpesa');
    const [phoneNumber, setPhoneNumber] = useState('+254');
    const [isLoading, setIsLoading] = useState(false);
    const { userEmail } = useAuth();
    const router = useRouter();

    const handleProceed = async () => {
        if (selectedId === 'mpesa') {
            if (!phoneNumber || phoneNumber.length < 10) {
                Alert.alert('Error', 'Please enter a valid M-Pesa phone number.');
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/auth/stkpush`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone_number: phoneNumber,
                        amount: 1,
                        user_email: userEmail
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || 'Failed to initiate M-Pesa payment');
                }

                Alert.alert(
                    'Payment Initiated',
                    'Please check your phone for the M-Pesa STK push to complete the payment.',
                    [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
                );
            } catch (error: any) {
                Alert.alert('Payment Error', error.message);
            } finally {
                setIsLoading(false);
            }
        } else {
            const method = PAYMENT_METHODS.find(m => m.id === selectedId);
            Alert.alert(
                'Order Placed',
                `Thank you for your order! You selected ${method?.name}. We will contact you with payment instructions.`,
                [{ text: 'Great!', onPress: () => router.replace('/(tabs)') }]
            );
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: currentColors.background }]} contentContainerStyle={styles.content}>
            <Text style={[styles.title, { color: currentColors.text }]}>How would you like to pay?</Text>
            <Text style={styles.subtitle}>Select your preferred payment method to complete the order.</Text>

            <View style={styles.methodsContainer}>
                {PAYMENT_METHODS.map((method) => (
                    <View key={method.id}>
                        <Pressable
                            onPress={() => setSelectedId(method.id)}
                            style={[
                                styles.methodCard,
                                { backgroundColor: currentColors.card, borderColor: currentColors.border },
                                selectedId === method.id && { borderColor: currentColors.tint, borderWidth: 2 }
                            ]}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: currentColors.background }]}>
                                {/* @ts-ignore */}
                                <FontAwesome name={method.icon} size={24} color={selectedId === method.id ? currentColors.tint : currentColors.tabIconDefault} />
                            </View>
                            <View style={styles.methodInfo}>
                                <Text style={[styles.methodName, { color: currentColors.text }]}>{method.name}</Text>
                                <Text style={styles.methodDesc}>{method.description}</Text>
                            </View>
                            <View style={[styles.radio, { borderColor: currentColors.border }]}>
                                {selectedId === method.id && <View style={[styles.radioSelected, { backgroundColor: currentColors.tint }]} />}
                            </View>
                        </Pressable>

                        {selectedId === 'mpesa' && method.id === 'mpesa' && (
                            <View style={styles.phoneInputContainer}>
                                <Text style={[styles.inputLabel, { color: currentColors.tint }]}>Enter M-Pesa Phone Number</Text>
                                <TextInput
                                    style={[styles.phoneInput, { color: currentColors.text, borderColor: currentColors.border }]}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    placeholder="+2547XXXXXXXX"
                                    placeholderTextColor="#636366"
                                />
                            </View>
                        )}
                    </View>
                ))}
            </View>

            <View style={styles.footer}>
                <Pressable
                    style={[styles.payBtn, { backgroundColor: currentColors.tint }, isLoading && { opacity: 0.7 }]}
                    onPress={handleProceed}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.payBtnText}>
                            Proceed with {PAYMENT_METHODS.find(m => m.id === selectedId)?.name}
                        </Text>
                    )}
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 32,
        lineHeight: 24,
    },
    methodsContainer: {
        gap: 16,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    methodInfo: {
        flex: 1,
    },
    methodName: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 4,
    },
    methodDesc: {
        fontSize: 14,
        color: '#8E8E93',
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    footer: {
        marginTop: 48,
        paddingBottom: 40,
    },
    payBtn: {
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    payBtnText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '800',
    },
    phoneInputContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    phoneInput: {
        height: 50,
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
});
