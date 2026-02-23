import { useColorScheme } from '@/components/useColorScheme';
import { API_BASE_URL } from '@/constants/API';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    created_at: string;
}

function NotificationCard({ notif }: { notif: Notification }) {
    const date = new Date(notif.created_at);
    const formatted = date.toLocaleDateString('en-KE', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return 'exclamation-circle';
            case 'system': return 'cog';
            default: return 'info-circle';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'alert': return '#FF453A';
            case 'system': return '#0A84FF';
            default: return '#C5A028';
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardIconWrap}>
                <FontAwesome name={getIcon(notif.type) as any} size={20} color={getIconColor(notif.type)} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{notif.title}</Text>
                <Text style={styles.cardMessage}>{notif.message}</Text>
                <Text style={styles.cardDate}>{formatted}</Text>
            </View>
        </View>
    );
}

export default function NotificationsScreen() {
    const colorScheme = useColorScheme();
    const currentColors = Colors[colorScheme ?? 'light'];
    const { isLoggedIn, userName } = useAuth();
    const router = useRouter();

    const [notifs, setNotifs] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/notifications`);
            if (res.ok) {
                const data = await res.json();
                setNotifs(data);
            }
        } catch (e) {
            console.error('Failed to fetch notifications:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            {/* Status / CTA Header */}
            <View style={styles.statusHeader}>
                {isLoggedIn ? (
                    /* Logged-in: show status + profile link */
                    <View style={styles.statusRow}>
                        <View style={styles.statusBadge}>
                            <View style={[styles.statusDot, { backgroundColor: '#30D158' }]} />
                            <Text style={styles.statusText}>Logged in as {userName}</Text>
                        </View>
                        <Pressable
                            style={styles.profileLink}
                            onPress={() => router.push('/(tabs)/profile')}
                        >
                            <Text style={styles.profileLinkText}>View Profile</Text>
                            <FontAwesome name="chevron-right" size={11} color="#C5A028" />
                        </Pressable>
                    </View>
                ) : (
                    /* Guest: show Sign Up / Sign In CTA */
                    <View style={styles.ctaRow}>
                        <View style={styles.ctaLeft}>
                            <View style={[styles.statusDot, { backgroundColor: '#8E8E93' }]} />
                            <Text style={styles.statusText}>Guest Mode</Text>
                        </View>
                        <View style={styles.ctaButtons}>
                            <Pressable
                                style={styles.ctaSignIn}
                                onPress={() => router.push('/(auth)/login')}
                            >
                                <Text style={styles.ctaSignInText}>Sign In</Text>
                            </Pressable>
                            <Pressable
                                style={styles.ctaSignUp}
                                onPress={() => router.push('/(auth)/register')}
                            >
                                <Text style={styles.ctaSignUpText}>Sign Up</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </View>

            <FlatList
                data={notifs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <NotificationCard notif={item} />}
                contentContainerStyle={notifs.length === 0 ? styles.emptyContainer : styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C5A028" />}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <FontAwesome name="bell-slash-o" size={48} color="#636366" />
                        <Text style={styles.emptyTitle}>No Notifications</Text>
                        <Text style={styles.emptySubtitle}>
                            You're all caught up! Admin announcements will appear here.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statusHeader: {
        padding: 14,
        backgroundColor: '#1A1A1E',
        borderBottomWidth: 1,
        borderBottomColor: '#2C2C2E',
    },
    /* Logged-in row */
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2C2E',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        color: '#E8E8ED',
        fontSize: 12,
        fontWeight: '700',
    },
    profileLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(197, 160, 40, 0.12)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(197, 160, 40, 0.3)',
    },
    profileLinkText: {
        color: '#C5A028',
        fontSize: 12,
        fontWeight: '700',
    },
    /* Guest CTA row */
    ctaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ctaLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2C2E',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    ctaButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    ctaSignIn: {
        backgroundColor: '#2C2C2E',
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#3C3C3E',
    },
    ctaSignInText: {
        color: '#E8E8ED',
        fontSize: 13,
        fontWeight: '700',
    },
    ctaSignUp: {
        backgroundColor: '#C5A028',
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
    },
    ctaSignUpText: {
        color: '#000',
        fontSize: 13,
        fontWeight: '800',
    },
    /* List */
    listContent: {
        padding: 16,
        gap: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#E8E8ED',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    /* Cards */
    card: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1E',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    cardIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2C2C2E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        color: '#E8E8ED',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardMessage: {
        color: '#8E8E93',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    cardDate: {
        color: '#636366',
        fontSize: 12,
    },
});
