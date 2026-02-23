import { useColorScheme } from '@/components/useColorScheme';
import { API_BASE_URL } from '@/constants/API';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface Order {
    id: string;
    user_email: string;
    phone_number: string;
    amount: number;
    payment_method: string;
    status: string;
    created_at: string;
}

function StatusBadge({ status }: { status: string }) {
    const color = status === 'paid' ? '#30D158' :
        status === 'failed' ? '#FF453A' :
            status === 'cancelled' ? '#FF9F0A' :
                status === 'refunded' ? '#0A84FF' :
                    '#C5A028';
    const bg = status === 'paid' ? '#0D2E1A' :
        status === 'failed' ? '#2E0D0D' :
            status === 'cancelled' ? '#2E1D00' :
                status === 'refunded' ? '#001A2E' :
                    '#2E2300';
    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            <Text style={[styles.badgeText, { color }]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
        </View>
    );
}

function OrderCard({ order }: { order: Order }) {
    const date = new Date(order.created_at);
    const formatted = date.toLocaleDateString('en-KE', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardIconWrap}>
                    <FontAwesome name="mobile" size={22} color="#C5A028" />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardMethod}>M-Pesa</Text>
                    <Text style={styles.cardPhone}>{order.phone_number}</Text>
                </View>
                <StatusBadge status={order.status} />
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.cardLabel}>Amount</Text>
                    <Text style={styles.cardAmount}>Ksh {order.amount.toLocaleString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.cardLabel}>Date</Text>
                    <Text style={styles.cardDate}>{formatted}</Text>
                </View>
            </View>
        </View>
    );
}

export default function OrdersScreen() {
    const colorScheme = useColorScheme();
    const currentColors = Colors[colorScheme ?? 'light'];
    const { userEmail, isLoggedIn } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'cancelled', label: 'Cancelled' },
        { id: 'refunded', label: 'Refunded' },
    ];

    const fetchOrders = useCallback(async () => {
        if (!userEmail) return;
        try {
            const res = await fetch(`${API_BASE_URL}/orders?email=${encodeURIComponent(userEmail)}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (e) {
            console.error('Failed to fetch orders:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userEmail]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    if (!isLoggedIn) {
        return (
            <View style={[styles.center, { backgroundColor: currentColors.background }]}>
                <FontAwesome name="lock" size={48} color="#636366" />
                <Text style={styles.emptyTitle}>Sign In Required</Text>
                <Text style={styles.emptySubtitle}>Please sign in to view your orders.</Text>
                <Pressable style={styles.signInBtn} onPress={() => router.push('/(auth)/login')}>
                    <Text style={styles.signInBtnText}>Sign In</Text>
                </Pressable>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: currentColors.background }]}>
                <ActivityIndicator size="large" color="#C5A028" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <View style={styles.tabContainer}>
                {tabs.map((tab) => (
                    <Pressable
                        key={tab.id}
                        onPress={() => setActiveTab(tab.id)}
                        style={[
                            styles.tab,
                            activeTab === tab.id && { borderBottomColor: '#C5A028' }
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === tab.id ? { color: '#C5A028', fontWeight: '800' } : { color: '#8E8E93' }
                        ]}>
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
            <FlatList
                data={orders.filter(o => activeTab === 'all' ? true : o.status === activeTab)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <OrderCard order={item} />}
                contentContainerStyle={orders.length === 0 ? styles.emptyContainer : styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C5A028" />}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <FontAwesome name="inbox" size={56} color="#636366" />
                        <Text style={styles.emptyTitle}>No Orders Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Your payment history will appear here after your first purchase.
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
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        backgroundColor: '#1A1A1E',
        borderBottomWidth: 1,
        borderBottomColor: '#2C2C2E',
    },
    tab: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        gap: 14,
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
        padding: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#E8E8ED',
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
    },
    signInBtn: {
        marginTop: 24,
        backgroundColor: '#C5A028',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 14,
    },
    signInBtnText: {
        color: '#000',
        fontWeight: '800',
        fontSize: 16,
    },
    card: {
        backgroundColor: '#1A1A1E',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardIconWrap: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: '#2C2C2E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    cardMethod: {
        color: '#E8E8ED',
        fontWeight: '700',
        fontSize: 16,
    },
    cardPhone: {
        color: '#8E8E93',
        fontSize: 13,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#2C2C2E',
        marginVertical: 14,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    cardLabel: {
        fontSize: 11,
        color: '#636366',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 4,
        fontWeight: '600',
    },
    cardAmount: {
        color: '#C5A028',
        fontSize: 18,
        fontWeight: '800',
    },
    cardDate: {
        color: '#8E8E93',
        fontSize: 13,
    },
});
