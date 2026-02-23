import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

type IconName = React.ComponentProps<typeof FontAwesome>['name'];

function ProfileField({
    icon,
    label,
    value,
    editing,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    currentColors,
}: {
    icon: IconName;
    label: string;
    value: string;
    editing: boolean;
    onChangeText: (t: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numbers-and-punctuation';
    currentColors: any;
}) {
    return (
        <View style={styles.fieldRow}>
            <View style={[styles.fieldIconWrap, { backgroundColor: currentColors.background }]}>
                <FontAwesome name={icon} size={16} color="#C5A028" />
            </View>
            <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{label}</Text>
                {editing ? (
                    <TextInput
                        style={[styles.fieldInput, { color: currentColors.text }]}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
                        placeholderTextColor="#636366"
                        keyboardType={keyboardType}
                    />
                ) : (
                    <Text style={[styles.fieldValue, { color: currentColors.text }, !value && styles.fieldEmpty]}>
                        {value || 'Not provided'}
                    </Text>
                )}
            </View>
        </View>
    );
}

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const currentColors = Colors[colorScheme ?? 'light'];
    const {
        isLoggedIn, userName, userEmail, userRole,
        userPhone, userDateOfBirth, userAltContact,
        updateProfile, logout,
    } = useAuth();
    const { themePreference, setThemePreference } = useTheme();
    const router = useRouter();

    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(userName ?? '');
    const [editPhone, setEditPhone] = useState(userPhone ?? '');
    const [editDob, setEditDob] = useState(userDateOfBirth ?? '');
    const [editAlt, setEditAlt] = useState(userAltContact ?? '');

    // If not logged in, show an auth gate
    if (!isLoggedIn) {
        return (
            <View style={[styles.gateContainer, { backgroundColor: currentColors.background }]}>
                <View style={[styles.gateLockWrap, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
                    <FontAwesome name="lock" size={56} color="#C5A028" />
                </View>
                <Text style={[styles.gateTitle, { color: currentColors.text }]}>Sign In to View Profile</Text>
                <Text style={styles.gateSubtitle}>
                    Create an account or sign in to manage your personal details.
                </Text>
                <Pressable style={styles.gateBtn} onPress={() => router.push('/(auth)/login')}>
                    <Text style={styles.gateBtnText}>Sign In</Text>
                </Pressable>
                <Pressable style={[styles.gateSecondaryBtn, { backgroundColor: currentColors.card, borderColor: currentColors.border }]} onPress={() => router.push('/(auth)/register')}>
                    <Text style={styles.gateSecondaryText}>Create Account</Text>
                </Pressable>
            </View>
        );
    }

    const getInitial = (name: string | null) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    };

    const handleSave = () => {
        if (!editName.trim()) {
            Alert.alert('Error', 'Name cannot be empty.');
            return;
        }
        updateProfile({
            name: editName.trim(),
            phone: editPhone.trim() || undefined,
            dateOfBirth: editDob.trim() || undefined,
            altContact: editAlt.trim() || undefined,
        });
        setEditing(false);
        Alert.alert('Saved', 'Your profile has been updated.');
    };

    const handleCancel = () => {
        setEditName(userName ?? '');
        setEditPhone(userPhone ?? '');
        setEditDob(userDateOfBirth ?? '');
        setEditAlt(userAltContact ?? '');
        setEditing(false);
    };

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out', style: 'destructive', onPress: () => {
                    logout();
                }
            },
        ]);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: currentColors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Avatar & Hero */}
                <View style={[styles.hero, { backgroundColor: currentColors.card, borderBottomColor: currentColors.border }]}>
                    <View style={[styles.avatarLarge, { borderColor: currentColors.border }]}>
                        <Text style={styles.avatarInitial}>{getInitial(userName)}</Text>
                    </View>
                    <Text style={[styles.heroName, { color: currentColors.text }]}>{userName}</Text>
                    <Text style={styles.heroEmail}>{userEmail}</Text>
                    <View style={[styles.roleBadge, userRole === 'Admin' && styles.roleBadgeAdmin]}>
                        <FontAwesome
                            name={userRole === 'Admin' ? 'shield' : 'user'}
                            size={11}
                            color={userRole === 'Admin' ? '#FF9F0A' : '#30D158'}
                        />
                        <Text style={[styles.roleText, userRole === 'Admin' && styles.roleTextAdmin]}>
                            {userRole}
                        </Text>
                    </View>
                </View>

                {/* Edit / Save Controls */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Personal Details</Text>
                        {!editing ? (
                            <Pressable style={[styles.editBtn, { backgroundColor: currentColors.card }]} onPress={() => setEditing(true)}>
                                <FontAwesome name="pencil" size={13} color="#C5A028" />
                                <Text style={styles.editBtnText}>Edit</Text>
                            </Pressable>
                        ) : (
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <Pressable style={styles.cancelBtn} onPress={handleCancel}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </Pressable>
                                <Pressable style={styles.saveBtn} onPress={handleSave}>
                                    <Text style={styles.saveBtnText}>Save</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>

                    <View style={[styles.card, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
                        <ProfileField
                            icon="user"
                            label="Full Name"
                            value={editing ? editName : userName ?? ''}
                            editing={editing}
                            onChangeText={setEditName}
                            placeholder="Your full name"
                            currentColors={currentColors}
                        />
                        <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
                        <ProfileField
                            icon="envelope"
                            label="Email"
                            value={userEmail ?? ''}
                            editing={false}
                            onChangeText={() => { }}
                            currentColors={currentColors}
                        />
                        <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
                        <ProfileField
                            icon="phone"
                            label="Phone Number"
                            value={editing ? editPhone : userPhone ?? ''}
                            editing={editing}
                            onChangeText={setEditPhone}
                            placeholder="0712 345 678"
                            keyboardType="phone-pad"
                            currentColors={currentColors}
                        />
                        <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
                        <ProfileField
                            icon="calendar"
                            label="Date of Birth"
                            value={editing ? editDob : userDateOfBirth ?? ''}
                            editing={editing}
                            onChangeText={setEditDob}
                            placeholder="DD/MM/YYYY"
                            keyboardType="numbers-and-punctuation"
                            currentColors={currentColors}
                        />
                        <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
                        <ProfileField
                            icon="users"
                            label="Alternate Contact"
                            value={editing ? editAlt : userAltContact ?? ''}
                            editing={editing}
                            onChangeText={setEditAlt}
                            placeholder="Name or phone of another contact"
                            currentColors={currentColors}
                        />
                    </View>
                </View>

                {/* Theme Settings */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>App Theme</Text>
                    </View>
                    <View style={[styles.card, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
                        <Pressable
                            style={[styles.themeOption, themePreference === 'light' && styles.themeOptionActive]}
                            onPress={() => setThemePreference('light')}
                        >
                            <View style={[styles.fieldIconWrap, { backgroundColor: currentColors.background }]}>
                                <FontAwesome name="sun-o" size={16} color={themePreference === 'light' ? '#C5A028' : '#8E8E93'} />
                            </View>
                            <Text style={[styles.themeOptionText, themePreference === 'light' && { color: currentColors.text, fontWeight: '700' }]}>Light</Text>
                        </Pressable>
                        <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
                        <Pressable
                            style={[styles.themeOption, themePreference === 'dark' && styles.themeOptionActive]}
                            onPress={() => setThemePreference('dark')}
                        >
                            <View style={[styles.fieldIconWrap, { backgroundColor: currentColors.background }]}>
                                <FontAwesome name="moon-o" size={16} color={themePreference === 'dark' ? '#C5A028' : '#8E8E93'} />
                            </View>
                            <Text style={[styles.themeOptionText, themePreference === 'dark' && { color: currentColors.text, fontWeight: '700' }]}>Dark</Text>
                        </Pressable>
                        <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
                        <Pressable
                            style={[styles.themeOption, themePreference === 'system' && styles.themeOptionActive]}
                            onPress={() => setThemePreference('system')}
                        >
                            <View style={[styles.fieldIconWrap, { backgroundColor: currentColors.background }]}>
                                <FontAwesome name="laptop" size={16} color={themePreference === 'system' ? '#C5A028' : '#8E8E93'} />
                            </View>
                            <Text style={[styles.themeOptionText, themePreference === 'system' && { color: currentColors.text, fontWeight: '700' }]}>System Setting</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Logout */}
                <Pressable
                    style={[styles.logoutBtn, { borderColor: currentColors.notification + '33' }]}
                    onPress={handleLogout}
                >
                    <FontAwesome name="sign-out" size={18} color="#FF453A" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: 48 },

    /* Auth gate */
    gateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    gateLockWrap: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
    },
    gateTitle: {
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 10,
    },
    gateSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
    gateBtn: {
        width: '100%',
        height: 56,
        backgroundColor: '#C5A028',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    gateBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
    gateSecondaryBtn: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    gateSecondaryText: { color: '#C5A028', fontSize: 16, fontWeight: '700' },

    /* Hero */
    hero: {
        alignItems: 'center',
        paddingTop: 32,
        paddingBottom: 24,
        marginBottom: 24,
        borderBottomWidth: 1,
    },
    avatarLarge: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#C5A028',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
        borderWidth: 3,
        borderColor: '#2C2C2E',
    },
    avatarInitial: {
        color: '#000',
        fontSize: 36,
        fontWeight: '900',
    },
    heroName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#E8E8ED',
        marginBottom: 4,
    },
    heroEmail: {
        fontSize: 13,
        color: '#8E8E93',
        marginBottom: 10,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(48, 209, 88, 0.12)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(48, 209, 88, 0.3)',
    },
    roleBadgeAdmin: {
        backgroundColor: 'rgba(255, 159, 10, 0.12)',
        borderColor: 'rgba(255, 159, 10, 0.3)',
    },
    roleText: {
        color: '#30D158',
        fontSize: 12,
        fontWeight: '700',
    },
    roleTextAdmin: { color: '#FF9F0A' },

    /* Section */
    section: { paddingHorizontal: 16, marginBottom: 24 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#1A1A1E',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#C5A028',
    },
    editBtnText: { color: '#C5A028', fontSize: 13, fontWeight: '700' },
    saveBtn: {
        backgroundColor: '#C5A028',
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
    },
    saveBtnText: { color: '#000', fontSize: 13, fontWeight: '800' },
    cancelBtn: {
        backgroundColor: '#2C2C2E',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },
    cancelBtnText: { color: '#8E8E93', fontSize: 13, fontWeight: '700' },

    /* Card */
    card: {
        borderRadius: 18,
        borderWidth: 1,
        overflow: 'hidden',
    },
    divider: {
        height: 1,
        backgroundColor: '#2C2C2E',
        marginLeft: 60,
    },

    /* Field */
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    fieldIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    fieldContent: { flex: 1 },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#636366',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    fieldValue: {
        fontSize: 15,
        color: '#E8E8ED',
        fontWeight: '500',
    },
    fieldEmpty: { color: '#636366', fontStyle: 'italic' },
    fieldInput: {
        fontSize: 15,
        color: '#E8E8ED',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#C5A028',
        fontWeight: '500',
    },

    /* Logout */
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginHorizontal: 16,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 69, 58, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 69, 58, 0.2)',
    },
    logoutText: {
        color: '#FF453A',
        fontSize: 16,
        fontWeight: '700',
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    themeOptionActive: {
        backgroundColor: 'rgba(197, 160, 40, 0.05)',
    },
    themeOptionText: {
        fontSize: 15,
        color: '#8E8E93',
        fontWeight: '500',
    },
    themeOptionTextActive: {
        color: '#E8E8ED',
        fontWeight: '700',
    },
});
