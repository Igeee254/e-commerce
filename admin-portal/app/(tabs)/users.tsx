import { FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { API_BASE_URL } from '../../constants/API';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: 'User' | 'Admin';
    created_at: string;
}

function getInitial(name: string | null) {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
}

export default function UsersScreen() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'User' | 'Admin'>('all');

    const displayed = users.filter(u => filter === 'all' || u.role === filter);
    const adminCount = users.filter(u => u.role === 'Admin').length;
    const userCount = users.filter(u => u.role === 'User').length;

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: { 'bypass-tunnel-reminder': 'true' },
            });
            if (res.ok) setUsers(await res.json());
        } catch (e) {
            console.error('Fetch users error:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const renderItem = ({ item }: { item: UserProfile }) => (
        <View style={styles.card}>
            <View style={[
                styles.avatar,
                { backgroundColor: item.role === 'Admin' ? '#FF9F0A22' : '#C5A02822' }
            ]}>
                <Text style={[
                    styles.avatarText,
                    { color: item.role === 'Admin' ? '#FF9F0A' : '#C5A028' }
                ]}>
                    {getInitial(item.full_name)}
                </Text>
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.userName}>{item.full_name || '(No Name)'}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.joinDate}>
                    Joined {new Date(item.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
            </View>
            <View style={[
                styles.roleBadge,
                item.role === 'Admin'
                    ? { backgroundColor: 'rgba(255,159,10,0.12)', borderColor: 'rgba(255,159,10,0.4)' }
                    : { backgroundColor: 'rgba(48,209,88,0.1)', borderColor: 'rgba(48,209,88,0.3)' }
            ]}>
                <FontAwesome
                    name={item.role === 'Admin' ? 'shield' : 'user'}
                    size={11}
                    color={item.role === 'Admin' ? '#FF9F0A' : '#30D158'}
                />
                <Text style={[
                    styles.roleText,
                    { color: item.role === 'Admin' ? '#FF9F0A' : '#30D158' }
                ]}>
                    {item.role}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Users</Text>
                <Text style={styles.subtitle}>{users.length} registered accounts</Text>
            </View>

            {/* Stats strip */}
            <View style={styles.statsStrip}>
                <View style={styles.statItem}>
                    <Text style={styles.statNum}>{users.length}</Text>
                    <Text style={styles.statLbl}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statNum, { color: '#30D158' }]}>{userCount}</Text>
                    <Text style={styles.statLbl}>Clients</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statNum, { color: '#FF9F0A' }]}>{adminCount}</Text>
                    <Text style={styles.statLbl}>Admins</Text>
                </View>
            </View>

            {/* Filter chips */}
            <View style={styles.filterRow}>
                {(['all', 'User', 'Admin'] as const).map(f => (
                    <View key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]}>
                        <Text
                            style={[styles.filterText, filter === f && styles.filterTextActive]}
                            onPress={() => setFilter(f)}
                        >
                            {f === 'all' ? 'All' : f === 'User' ? 'Clients' : 'Admins'}
                        </Text>
                    </View>
                ))}
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator color="#C5A028" style={{ marginTop: 40 }} size="large" />
            ) : (
                <FlatList
                    data={displayed}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchUsers(); }}
                            tintColor="#C5A028"
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <FontAwesome name="users" size={44} color="#3A3A3C" />
                            <Text style={styles.emptyText}>No users found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F11' },

    header: { padding: 20, paddingTop: 56 },
    title: { fontSize: 28, fontWeight: '900', color: '#E8E8ED' },
    subtitle: { fontSize: 13, color: '#8E8E93', marginTop: 2 },

    statsStrip: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1A1A1E', marginHorizontal: 20, borderRadius: 16,
        paddingVertical: 14, marginBottom: 16,
        borderWidth: 1, borderColor: '#2C2C2E',
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: 24, fontWeight: '900', color: '#E8E8ED' },
    statLbl: { fontSize: 11, color: '#8E8E93', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
    statDivider: { width: 1, height: 32, backgroundColor: '#2C2C2E' },

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
    avatar: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: 18, fontWeight: '900' },
    cardInfo: { flex: 1 },
    userName: { color: '#E8E8ED', fontSize: 14, fontWeight: '700', marginBottom: 2 },
    userEmail: { color: '#8E8E93', fontSize: 12 },
    joinDate: { color: '#636366', fontSize: 11, marginTop: 2 },
    roleBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1,
    },
    roleText: { fontSize: 11, fontWeight: '800' },

    emptyWrap: { alignItems: 'center', marginTop: 80, gap: 12 },
    emptyText: { color: '#8E8E93', fontSize: 15 },
});
