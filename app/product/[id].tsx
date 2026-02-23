import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { API_BASE_URL } from '@/constants/API';
import { Colors } from '@/constants/Colors';
import { Product } from '@/constants/mockData';
import { useCart } from '@/context/CartContext';
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const currentColors = Colors[colorScheme ?? 'light'];

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`);
            if (!response.ok) throw new Error("Product not found");
            const data = await response.json();
            setProduct(data);
        } catch (error) {
            console.error("Fetch error:", error);
            Alert.alert("Error", "Could not load product details.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: currentColors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={currentColors.tint} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={[styles.container, { backgroundColor: currentColors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: currentColors.text, fontSize: 18, fontWeight: '700' }}>Product not found</Text>
                <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: currentColors.tint, fontWeight: '800' }}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: product.image }} style={styles.image} />
                    <Pressable
                        style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
                        onPress={() => router.back()}
                    >
                        <FontAwesome name="chevron-left" size={18} color="#fff" />
                    </Pressable>
                </View>

                <View style={[styles.detailsContainer, { backgroundColor: currentColors.background }]}>
                    <Text style={styles.category}>{product.category}</Text>
                    <Text style={[styles.name, { color: currentColors.text }]}>{product.name}</Text>
                    <Text style={styles.price}>{product.price}</Text>

                    <View style={[styles.separator, { backgroundColor: currentColors.border }]} />

                    <Text style={[styles.descriptionTitle, { color: currentColors.text }]}>Selection Insight</Text>
                    <Text style={styles.description}>{product.description}</Text>

                    <View style={styles.specsContainer}>
                        <View style={[styles.specItem, { backgroundColor: currentColors.card, borderColor: currentColors.border, borderWidth: 1 }]}>
                            <FontAwesome name="shield" size={16} color={currentColors.tint} />
                            <Text style={[styles.specText, { color: currentColors.text }]}>Premium Quality</Text>
                        </View>
                        <View style={[styles.specItem, { backgroundColor: currentColors.card, borderColor: currentColors.border, borderWidth: 1 }]}>
                            <FontAwesome name="truck" size={16} color={currentColors.tint} />
                            <Text style={[styles.specText, { color: currentColors.text }]}>Express Delivery</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: currentColors.background, borderTopColor: currentColors.border }]}>
                <Pressable
                    style={[styles.addButton, { backgroundColor: currentColors.tint }]}
                    onPress={() => {
                        addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
                        Alert.alert('Success', `${product.name} added to cart!`);
                    }}
                >
                    <Text style={styles.addButtonText}>Add to Collection</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    imageContainer: {
        position: 'relative',
        height: 480,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsContainer: {
        padding: 32,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -32,
    },
    category: {
        fontSize: 14,
        color: '#C5A028',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    name: {
        fontSize: 34,
        fontWeight: 'bold',
        marginTop: 12,
        letterSpacing: -1,
    },
    price: {
        fontSize: 24,
        color: '#C5A028',
        fontWeight: '800',
        marginTop: 8,
    },
    separator: {
        height: 1,
        marginVertical: 32,
    },
    descriptionTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 17,
        lineHeight: 28,
        color: '#8E8E93',
        fontWeight: '500',
    },
    specsContainer: {
        flexDirection: 'row',
        marginTop: 32,
        gap: 12,
    },
    specItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 10,
    },
    specText: {
        fontSize: 13,
        fontWeight: '700',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    addButton: {
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    addButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
