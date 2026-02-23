import { FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { API_BASE_URL } from '../../constants/API';

interface Feedback {
    id: string;
    user_email: string;
    message: string;
    created_at: string;
}

export default function FeedbackScreen() {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFeedback = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/admin/feedback`, {
                headers: { 'bypass-tunnel-reminder': 'true' }
            });

            if (response.ok) {
                const data = await response.json();
                setFeedback(data);
            } else {
                Alert.alert('Error', 'Failed to fetch feedback.');
            }
        } catch (error) {
            console.error('Fetch feedback error:', error);
            Alert.alert('Error', 'Failed to connect to the server.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchFeedback();
    }, [fetchFeedback]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchFeedback();
    }, [fetchFeedback]);

    const renderItem = ({ item }: { item: Feedback }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.userIcon}>
                    <FontAwesome name="user-circle" size={20} color="#C5A028" />
                </View>
                <Text style={styles.email}>{item.user_email}</Text>
                <Text style={styles.date}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>
            <Text style={styles.message}>{item.message}</Text>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#C5A028" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Customer Feedback</Text>
                <Text style={styles.subtitle}>Messages from your customers</Text>
            </View>

            <FlatList
                data={feedback}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C5A028" />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <FontAwesome name="comments-o" size={50} color="#3A3A3C" />
                        <Text style={styles.emptyText}>No feedback yet</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F11',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F0F11',
    },
    header: {
        padding: 20,
        paddingTop: 56,
        backgroundColor: '#0F0F11',
        borderBottomWidth: 1,
        borderBottomColor: '#2C2C2E',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
        marginTop: 4,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    userIcon: {
        marginRight: 8,
    },
    email: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    date: {
        color: '#8E8E93',
        fontSize: 12,
    },
    message: {
        color: '#E5E5EA',
        fontSize: 15,
        lineHeight: 22,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: '#8E8E93',
        fontSize: 16,
        marginTop: 12,
    },
});
