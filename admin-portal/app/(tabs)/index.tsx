import { FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { API_BASE_URL } from '../../constants/API';
import { useAuth } from '../../context/AuthContext';

interface Order {
    id: string;
    user_email: string;
    amount: number;
    status: string;
    created_at: string;
}

interface ItemRequest {
    status: string;
}

interface Feedback {
    id: string;
}

const STATUS_COLORS: Record<string, string> = {
    paid: '#30D158',
    pending: '#FF9F0A',
    failed: '#FF453A',
    cancelled: '#8E8E93',
};

function StatCard({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: string | number;
    icon: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return (
        <View style={[styles.statCard, { borderTopColor: color }]}>
            <View style={[styles.statIconWrap, { backgroundColor: color + '22' }]}>
                <FontAwesome name={icon} size={18} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

export default function DashboardScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [requests, setRequests] = useState<ItemRequest[]>([]);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { logout, user } = useAuth();

    const totalRevenue = orders
        .filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + (o.amount || 0), 0);

    const todayRevenue = orders
        .filter(o => {
            if (o.status !== 'paid') return false;
            const d = new Date(o.created_at);
            const now = new Date();
            return d.toDateString() === now.toDateString();
        })
        .reduce((sum, o) => sum + (o.amount || 0), 0);

    const pendingRequests = requests.filter(r => r.status === 'pending').length;

    const fetchData = useCallback(async () => {
        try {
            const [ordersRes, requestsRes, feedbackRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/orders`, { headers: { 'bypass-tunnel-reminder': 'true' } }),
                fetch(`${API_BASE_URL}/admin/requests`, { headers: { 'bypass-tunnel-reminder': 'true' } }),
                fetch(`${API_BASE_URL}/admin/feedback`, { headers: { 'bypass-tunnel-reminder': 'true' } }),
            ]);
            if (ordersRes.ok) setOrders(await ordersRes.json());
            if (requestsRes.ok) setRequests(await requestsRes.json());
            if (feedbackRes.ok) setFeedback(await feedbackRes.json());
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const onRefresh = () => { setRefreshing(true); fetchData(); };

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: logout },
        ]);
    };

    const ListHeader = () => (
        <View style={styles.content}>
            {/* Header */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.greeting}>Alpha Smart Webs</Text>
                    <Text style={styles.sub}>Admin Dashboard</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <FontAwesome name="power-off" size={20} color="#FF453A" />
                </TouchableOpacity>
            </View>

            {/* Revenue Banner */}
            <View style={styles.revenueBanner}>
                <View>
                    <Text style={styles.revenueLabel}>Total Revenue</Text>
                    <Text style={styles.revenueValue}>Ksh {totalRevenue.toLocaleString()}</Text>
                </View>
                <View style={styles.revenueDivider} />
                <View>
                    <Text style={styles.revenueLabel}>Today</Text>
                    <Text style={[styles.revenueValue, { color: '#30D158' }]}>
                        Ksh {todayRevenue.toLocaleString()}
                    </Text>
                </View>
            </View>

            {/* Stat Cards */}
            <View style={styles.statsRow}>
                <StatCard
                    label="Orders"
                    value={orders.length}
                    icon="list-alt"
                    color="#0A84FF"
                />
                <StatCard
                    label="Pending Req."
                    value={pendingRequests}
                    icon="inbox"
                    color="#C5A028"
                />
                <StatCard
                    label="Feedback"
                    value={feedback.length}
                    icon="comments"
                    color="#30D158"
                />
            </View>

            <Text style={styles.sectionTitle}>Recent Orders</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={orders.slice(0, 20)}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={<ListHeader />}
                renderItem={({ item }) => (
                    <View style={styles.orderCard}>
                        <View style={styles.orderLeft}>
                            <Text style={styles.orderEmail} numberOfLines={1}>{item.user_email}</Text>
                            <Text style={styles.orderDate}>
                                {new Date(item.created_at).toLocaleDateString('en-KE', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                })}
                            </Text>
                        </View>
                        <View style={styles.orderRight}>
                            <Text style={styles.orderAmount}>Ksh {item.amount?.toLocaleString()}</Text>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: (STATUS_COLORS[item.status] ?? '#636366') + '22', borderColor: STATUS_COLORS[item.status] ?? '#636366' }
                            ]}>
                                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] ?? '#636366' }]}>
                                    {item.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C5A028" />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyWrap}>
                            <FontAwesome name="inbox" size={40} color="#3A3A3C" />
                            <Text style={styles.emptyText}>No orders yet</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F11' },
    listContent: { paddingBottom: 40 },
    content: { padding: 20, paddingTop: 56 },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: { fontSize: 24, fontWeight: '900', color: '#E8E8ED' },
    sub: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
    logoutBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#1A1A1E',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#2C2C2E',
    },

    revenueBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1E',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#2C2C2E',
        gap: 24,
    },
    revenueLabel: { fontSize: 11, color: '#8E8E93', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    revenueValue: { fontSize: 24, fontWeight: '900', color: '#E8E8ED' },
    revenueDivider: { width: 1, height: '80%', backgroundColor: '#2C2C2E' },

    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
    statCard: {
        flex: 1, backgroundColor: '#1A1A1E',
        borderRadius: 16, padding: 14,
        borderWidth: 1, borderColor: '#2C2C2E',
        borderTopWidth: 3,
    },
    statIconWrap: {
        width: 34, height: 34, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 10,
    },
    statValue: { fontSize: 22, fontWeight: '900', color: '#E8E8ED', marginBottom: 2 },
    statLabel: { fontSize: 10, color: '#8E8E93', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#E8E8ED', marginBottom: 12 },

    orderCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1A1A1E',
        padding: 14,
        marginHorizontal: 20,
        marginBottom: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    orderLeft: { flex: 1, marginRight: 12 },
    orderEmail: { color: '#E8E8ED', fontSize: 13, fontWeight: '600' },
    orderDate: { color: '#636366', fontSize: 11, marginTop: 3 },
    orderRight: { alignItems: 'flex-end', gap: 6 },
    orderAmount: { color: '#C5A028', fontSize: 14, fontWeight: '800' },
    statusBadge: {
        paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: 8, borderWidth: 1,
    },
    statusText: { fontSize: 10, fontWeight: '800' },

    emptyWrap: { alignItems: 'center', marginTop: 60, gap: 12 },
    emptyText: { color: '#8E8E93', fontSize: 14 },
});
