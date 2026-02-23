import { FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { API_BASE_URL } from '../../constants/API';

interface ItemRequest {
    id: string;
    item_name: string;
    user_email: string;
    status: string;
    created_at: string;
}

export default function RequestsScreen() {
    const [requests, setRequests] = useState<ItemRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'fulfilled'>('pending');

    const displayed = requests.filter(r => filter === 'all' || r.status === filter);
    const pendingCount = requests.filter(r => r.status === 'pending').length;

    const fetchRequests = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/requests`, {
                headers: { 'bypass-tunnel-reminder': 'true' },
            });
            if (response.ok) setRequests(await response.json());
            else Alert.alert('Error', 'Failed to fetch item requests.');
        } catch (error) {
            console.error('Fetch requests error:', error);
            Alert.alert('Error', 'Failed to connect to the server.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const handleFulfill = async (req: ItemRequest) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/fulfill`, {   // ← fixed URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
                body: JSON.stringify({ request_id: req.id, item_name: req.item_name, user_email: req.user_email }),
            });
            if (response.ok) {
                Alert.alert('Fulfilled', `Notification sent to ${req.user_email}.`);
                fetchRequests();
            } else throw new Error('Failed to fulfill');
        } catch (error) {
            Alert.alert('Error', 'Could not fulfill request.');
        }
    };

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const renderItem = ({ item }: { item: ItemRequest }) => (
        <View style={styles.card}>
            <View style={styles.cardIcon}>
                <FontAwesome name="search" size={16} color="#C5A028" />
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                <Text style={styles.userEmail}>{item.user_email}</Text>
                <Text style={styles.date}>
                    {new Date(item.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
            </View>
            {item.status === 'pending' ? (
                <TouchableOpacity style={styles.fulfillBtn} onPress={() => handleFulfill(item)}>
                    <FontAwesome name="check" size={14} color="#30D158" />
                    <Text style={styles.fulfillText}>Fulfill</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.doneWrap}>
                    <FontAwesome name="check-circle" size={18} color="#30D158" />
                    <Text style={styles.doneText}>Done</Text>
                </View>
            )}
        </View>
    );

    if (loading && !refreshing) {
        return <View style={styles.loading}><ActivityIndicator size="large" color="#C5A028" /></View>;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Item Requests</Text>
                    <Text style={styles.subtitle}>Searched items not in catalog</Text>
                </View>
                {pendingCount > 0 && (
                    <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>{pendingCount} pending</Text>
                    </View>
                )}
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
                {(['pending', 'all', 'fulfilled'] as const).map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, filter === f && styles.filterChipActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={displayed}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} tintColor="#C5A028" />}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <FontAwesome name="search" size={44} color="#3A3A3C" />
                        <Text style={styles.emptyText}>No requests</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F11' },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F11' },

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, paddingTop: 56,
    },
    title: { fontSize: 26, fontWeight: '900', color: '#E8E8ED' },
    subtitle: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
    pendingBadge: {
        backgroundColor: '#C5A028', borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 5,
    },
    pendingBadgeText: { color: '#000', fontSize: 12, fontWeight: '800' },

    filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 12 },
    filterChip: {
        paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
        backgroundColor: '#1A1A1E', borderWidth: 1, borderColor: '#2C2C2E',
    },
    filterChipActive: { backgroundColor: '#C5A028', borderColor: '#C5A028' },
    filterText: { color: '#8E8E93', fontSize: 13, fontWeight: '700' },
    filterTextActive: { color: '#000' },

    list: { padding: 16, paddingBottom: 40 },

    card: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#1A1A1E', borderRadius: 16, padding: 14,
        marginBottom: 10, borderWidth: 1, borderColor: '#2C2C2E',
    },
    cardIcon: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'rgba(197,160,40,0.12)',
        justifyContent: 'center', alignItems: 'center',
    },
    cardInfo: { flex: 1 },
    itemName: { color: '#E8E8ED', fontSize: 15, fontWeight: '700', marginBottom: 2 },
    userEmail: { color: '#8E8E93', fontSize: 12 },
    date: { color: '#636366', fontSize: 11, marginTop: 2 },

    fulfillBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12,
        backgroundColor: 'rgba(48,209,88,0.1)', borderWidth: 1, borderColor: '#30D158',
    },
    fulfillText: { color: '#30D158', fontSize: 13, fontWeight: '700' },
    doneWrap: { alignItems: 'center', gap: 2 },
    doneText: { color: '#30D158', fontSize: 10, fontWeight: '700' },

    emptyWrap: { alignItems: 'center', marginTop: 80, gap: 12 },
    emptyText: { color: '#8E8E93', fontSize: 15 },
});
