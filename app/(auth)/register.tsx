import { API_BASE_URL } from '@/constants/API';
import { useAuth } from '@/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function RegisterScreen() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [altContact, setAltContact] = useState('');
    const [adminCode, setAdminCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        if (!firstName || !lastName || !idNumber || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone || null,
                    date_of_birth: dateOfBirth || null,
                    alt_contact: altContact || null,
                    admin_code: adminCode || null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Signup failed');
            }

            // After successful signup, log them in with all profile fields
            login({
                email,
                name: firstName,
                role: data.role,
                phone: phone || undefined,
                dateOfBirth: dateOfBirth || undefined,
                altContact: altContact || undefined,
            });

            Alert.alert('Success', `Welcome to Alpha Smart Webs! You are registered as a ${data.role}.`, [
                { text: 'OK', onPress: () => router.replace('/(tabs)/shop') }
            ]);
        } catch (error: any) {
            const msg = error.message || '';
            if (
                msg.includes('Network request failed') ||
                msg.includes('connection') ||
                msg.includes('connect') ||
                msg.includes('failed') && !msg.includes('Signup')
            ) {
                Alert.alert(
                    'Connection Error',
                    'Could not reach the server. Make sure your phone is on the same Wi-Fi as your PC and the backend is running.'
                );
            } else {
                Alert.alert('Error', msg || 'Something went wrong. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <FontAwesome name="user-plus" size={50} color="#C5A028" />
                    </View>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join our exclusive collection today</Text>
                </View>

                <View style={styles.form}>
                    {/* Name Row */}
                    <View style={styles.row}>
                        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>First Name <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="First"
                                placeholderTextColor="#636366"
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                        </View>
                        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Last Name <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Last"
                                placeholderTextColor="#636366"
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="your@email.com"
                            placeholderTextColor="#636366"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    {/* ID Number */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>ID Number <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="12345678"
                            placeholderTextColor="#636366"
                            value={idNumber}
                            onChangeText={setIdNumber}
                            keyboardType="number-pad"
                        />
                    </View>

                    {/* Phone Number */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Phone Number <Text style={styles.optional}>(optional)</Text></Text>
                        <View style={styles.inputWithIcon}>
                            <FontAwesome name="phone" size={16} color="#636366" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, styles.inputPaddedLeft]}
                                placeholder="0712 345 678"
                                placeholderTextColor="#636366"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Date of Birth */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Date of Birth <Text style={styles.optional}>(optional)</Text></Text>
                        <View style={styles.inputWithIcon}>
                            <FontAwesome name="calendar" size={16} color="#636366" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, styles.inputPaddedLeft]}
                                placeholder="DD/MM/YYYY"
                                placeholderTextColor="#636366"
                                value={dateOfBirth}
                                onChangeText={setDateOfBirth}
                                keyboardType="numbers-and-punctuation"
                            />
                        </View>
                    </View>

                    {/* Alternate Contact */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Alternate Contact <Text style={styles.optional}>(optional)</Text></Text>
                        <View style={styles.inputWithIcon}>
                            <FontAwesome name="user" size={16} color="#636366" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, styles.inputPaddedLeft]}
                                placeholder="Name or phone of another contact"
                                placeholderTextColor="#636366"
                                value={altContact}
                                onChangeText={setAltContact}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={[styles.input, { paddingRight: 50 }]}
                                placeholder="••••••••"
                                placeholderTextColor="#636366"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <Pressable
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <FontAwesome
                                    name={showPassword ? "eye" : "eye-slash"}
                                    size={20}
                                    color="#C5A028"
                                />
                            </Pressable>
                        </View>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password <Text style={styles.required}>*</Text></Text>
                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={[styles.input, { paddingRight: 50 }]}
                                placeholder="••••••••"
                                placeholderTextColor="#636366"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <Pressable
                                style={styles.eyeIcon}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <FontAwesome
                                    name={showConfirmPassword ? "eye" : "eye-slash"}
                                    size={20}
                                    color="#C5A028"
                                />
                            </Pressable>
                        </View>
                    </View>

                    <Pressable
                        style={[styles.registerBtn, isLoading && { opacity: 0.7 }]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.registerBtnText}>Create Account</Text>
                        )}
                    </Pressable>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <Pressable onPress={() => router.back()}>
                        <Text style={styles.signInText}>Sign In</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F11',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 32,
        paddingTop: 80,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1A1A1E',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#E8E8ED',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 6,
    },
    form: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#C5A028',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    required: {
        color: '#FF453A',
        fontWeight: 'bold',
    },
    optional: {
        color: '#636366',
        fontSize: 10,
        textTransform: 'none',
        letterSpacing: 0,
        fontWeight: '400',
    },
    input: {
        height: 56,
        backgroundColor: '#1A1A1E',
        borderRadius: 14,
        paddingHorizontal: 16,
        color: '#E8E8ED',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    inputWithIcon: {
        position: 'relative',
        justifyContent: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    inputPaddedLeft: {
        paddingLeft: 44,
    },
    passwordWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        padding: 8,
    },
    registerBtn: {
        height: 60,
        backgroundColor: '#C5A028',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    registerBtnText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
        paddingBottom: 40,
    },
    footerText: {
        color: '#8E8E93',
        fontSize: 14,
    },
    signInText: {
        color: '#C5A028',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
