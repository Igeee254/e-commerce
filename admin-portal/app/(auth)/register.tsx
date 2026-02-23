import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { API_BASE_URL } from '../../constants/API';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminCode, setAdminCode] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !password || !adminCode) {
            Alert.alert('Error', 'Please fill in all fields including the Admin Secret Code.');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'bypass-tunnel-reminder': 'true'
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    admin_code: adminCode
                }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.role !== 'Admin') {
                    Alert.alert(
                        'Invalid Secret Code',
                        'The secret code provided is incorrect. Admin accounts require a valid unique code.'
                    );
                    return;
                }

                // Auto-login if backend returned a token
                if (data.access_token) {
                    await login(data);
                    router.replace('/(tabs)');
                } else {
                    Alert.alert(
                        'Success',
                        'Admin account created! Please sign in.',
                        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
                    );
                }
            } else {
                Alert.alert('Registration Failed', data.detail || 'Failed to create account');
            }
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('Error', 'Failed to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Admin Account</Text>
                    <Text style={styles.subtitle}>Enter your details and secret code</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="First Name"
                                placeholderTextColor="#636366"
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Last Name"
                                placeholderTextColor="#636366"
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="admin@example.com"
                            placeholderTextColor="#636366"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#636366"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Admin Secret Code</Text>
                        <TextInput
                            style={[styles.input, { borderColor: '#C5A028', borderWidth: 1.5 }]}
                            placeholder="Unique admin code"
                            placeholderTextColor="#636366"
                            value={adminCode}
                            onChangeText={setAdminCode}
                            secureTextEntry
                        />
                        <Text style={styles.helperText}>Only authorized admins can register.</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.registerButtonText}>Register Admin</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginHighlight}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
    },
    form: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#1C1C1E',
        borderRadius: 12,
        padding: 16,
        color: '#FFFFFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    helperText: {
        color: '#636366',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
    registerButton: {
        backgroundColor: '#C5A028',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 12,
    },
    registerButtonText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: '700',
    },
    loginLink: {
        marginTop: 24,
        alignItems: 'center',
        marginBottom: 40,
    },
    loginText: {
        color: '#8E8E93',
        fontSize: 14,
    },
    loginHighlight: {
        color: '#C5A028',
        fontWeight: '600',
    },
});
