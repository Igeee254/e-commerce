import { FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { API_BASE_URL } from '../../constants/API';

type NotifType = 'info' | 'alert' | 'system';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    created_at: string;
}

const TYPE_CONFIG: Record<NotifType, { label: string; icon: React.ComponentProps<typeof FontAwesome>['name']; color: string }> = {
    info: { label: 'Info', icon: 'info-circle', color: '#C5A028' },
    alert: { label: 'Alert', icon: 'exclamation-circle', color: '#FF453A' },
    system: { label: 'System', icon: 'cog', color: '#0A84FF' },
};

export default function BroadcastScreen() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<NotifType>('info');
    const [isSending, setIsSending] = useState(false);

    const [history, setHistory] = useState<Notification[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/notifications`, {
                headers: { 'bypass-tunnel-reminder': 'true' },
            });
            if (res.ok) setHistory(await res.json());
        } catch (e) {
            console.error('History fetch error:', e);
        } finally {
            setLoadingHistory(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const onRefresh = () => { setRefreshing(true); fetchHistory(); };

    const handleSend = async () => {
        if (!title || !message) {
            Alert.alert('Error', 'Please enter both a title and message.');
            return;
        }
        setIsSending(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
                body: JSON.stringify({ title, message, type }),
            });
            if (!res.ok) throw new Error('Failed');
            Alert.alert('Sent!', `"${title}" broadcast to all users.`);
            setTitle(''); setMessage('');
            fetchHistory();
        } catch (e) {
            Alert.alert('Error', 'Could not broadcast notification.');
        } finally {
            setIsSending(false);
        }
    };

    const cfg = TYPE_CONFIG[type];

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Text style={styles.pageTitle}>Broadcast</Text>
            <Text style={styles.pageSub}>Send an update to all users</Text>

            {/* Type selector */}
            <Text style={styles.label}>Message Type</Text>
            <View style={styles.typeRow}>
                {(Object.keys(TYPE_CONFIG) as NotifType[]).map(t => {
                    const c = TYPE_CONFIG[t];
                    const active = type === t;
                    return (
                        <Pressable
                            key={t}
                            style={[styles.typeChip, active && { backgroundColor: c.color + '22', borderColor: c.color }]}
                            onPress={() => setType(t)}
                        >
                            <FontAwesome name={c.icon} size={14} color={active ? c.color : '#8E8E93'} />
                            <Text style={[styles.typeChipText, active && { color: c.color }]}>{c.label}</Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Form */}
            <Text style={styles.label}>Title</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. New Collection Available"
                placeholderTextColor="#636366"
                value={title} onChangeText={setTitle}
            />

            <Text style={styles.label}>Message</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write your message here..."
                placeholderTextColor="#636366"
                multiline numberOfLines={5}
                value={message} onChangeText={setMessage}
            />

            {/* Preview */}
            {(title || message) && (
                <View style={[styles.preview, { borderColor: cfg.color + '44' }]}>
                    <View style={styles.previewHeader}>
                        <FontAwesome name={cfg.icon} size={14} color={cfg.color} />
                        <Text style={[styles.previewType, { color: cfg.color }]}>{cfg.label} Preview</Text>
                    </View>
                    <Text style={styles.previewTitle}>{title || '(no title)'}</Text>
                    <Text style={styles.previewMsg}>{message || '(no message)'}</Text>
                </View>
            )}

            {/* Send Button */}
            <Pressable
                style={[styles.sendBtn, { opacity: isSending ? 0.7 : 1, backgroundColor: cfg.color }]}
                onPress={handleSend} disabled={isSending}
            >
                <FontAwesome name="send" size={16} color="#000" />
                <Text style={styles.sendBtnText}>{isSending ? 'Sending...' : 'Broadcast to All'}</Text>
            </Pressable>

            {/* History */}
            <View style={styles.historySection}>
                <Text style={styles.historySectionTitle}>Sent Notifications</Text>
                {loadingHistory ? (
                    <ActivityIndicator color="#C5A028" style={{ marginTop: 16 }} />
                ) : history.length === 0 ? (
                    <View style={styles.emptyWrap}>
                        <FontAwesome name="send-o" size={32} color="#3A3A3C" />
                        <Text style={styles.emptyText}>No broadcasts yet</Text>
                    </View>
                ) : (
                    history.map(n => {
                        const c = TYPE_CONFIG[n.type as NotifType] ?? TYPE_CONFIG.info;
                        return (
                            <View key={n.id} style={[styles.histCard, { borderLeftColor: c.color }]}>
                                <View style={styles.histCardHeader}>
                                    <FontAwesome name={c.icon} size={13} color={c.color} />
                                    <Text style={[styles.histType, { color: c.color }]}>{c.label}</Text>
                                    <Text style={styles.histDate}>
                                        {new Date(n.created_at).toLocaleDateString('en-KE', {
                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                        })}
                                    </Text>
                                </View>
                                <Text style={styles.histTitle}>{n.title}</Text>
                                <Text style={styles.histMsg}>{n.message}</Text>
                            </View>
                        );
                    })
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, paddingTop: 56, paddingBottom: 60, backgroundColor: '#0F0F11', flexGrow: 1 },

    pageTitle: { fontSize: 28, fontWeight: '900', color: '#E8E8ED', marginBottom: 4 },
    pageSub: { fontSize: 13, color: '#8E8E93', marginBottom: 28 },

    label: { fontSize: 11, fontWeight: '700', color: '#C5A028', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },

    typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    typeChip: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        height: 44, borderRadius: 14, backgroundColor: '#1A1A1E', borderWidth: 1, borderColor: '#2C2C2E',
    },
    typeChipText: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },

    input: {
        backgroundColor: '#1A1A1E', borderRadius: 14, padding: 16,
        color: '#E8E8ED', fontSize: 15, borderWidth: 1, borderColor: '#2C2C2E', marginBottom: 16,
    },
    textArea: { height: 140, textAlignVertical: 'top' },

    preview: {
        backgroundColor: '#1A1A1E', borderRadius: 14, padding: 14,
        borderWidth: 1, marginBottom: 16,
    },
    previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    previewType: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    previewTitle: { color: '#E8E8ED', fontSize: 15, fontWeight: '700', marginBottom: 4 },
    previewMsg: { color: '#8E8E93', fontSize: 13, lineHeight: 18 },

    sendBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10, height: 56, borderRadius: 14, marginBottom: 36,
    },
    sendBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },

    historySection: {},
    historySectionTitle: { fontSize: 18, fontWeight: '800', color: '#E8E8ED', marginBottom: 16 },
    emptyWrap: { alignItems: 'center', gap: 10, marginTop: 16 },
    emptyText: { color: '#8E8E93', fontSize: 14 },
    histCard: {
        backgroundColor: '#1A1A1E', borderRadius: 14, padding: 14,
        marginBottom: 10, borderWidth: 1, borderColor: '#2C2C2E', borderLeftWidth: 3,
    },
    histCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    histType: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    histDate: { color: '#636366', fontSize: 11, marginLeft: 'auto' },
    histTitle: { color: '#E8E8ED', fontSize: 14, fontWeight: '700', marginBottom: 4 },
    histMsg: { color: '#8E8E93', fontSize: 13, lineHeight: 18 },
});
