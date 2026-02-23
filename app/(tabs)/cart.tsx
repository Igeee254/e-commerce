import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CartScreen() {
    const colorScheme = useColorScheme();
    const { cart, updateQuantity, removeFromCart, totalAmount } = useCart();
    const { isLoggedIn } = useAuth();
    const currentColors = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const handleCheckout = () => {
        if (isLoggedIn) {
            router.push('/checkout/payment');
        } else {
            router.push('/(auth)/login');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {cart.length > 0 ? (
                    <View style={styles.cartList}>
                        {cart.map((item) => (
                            <View key={item.id} style={[styles.cartItem, { backgroundColor: currentColors.card, borderColor: currentColors.border, borderWidth: 1 }]}>
                                <Image source={{ uri: item.image }} style={styles.itemImage} />
                                <View style={styles.itemDetails}>
                                    <View style={styles.itemHeader}>
                                        <Text style={[styles.itemName, { color: currentColors.text }]} numberOfLines={1}>{item.name}</Text>
                                        <Pressable
                                            style={styles.removeBtn}
                                            onPress={() => removeFromCart(item.id)}
                                        >
                                            <FontAwesome name="times-circle" size={20} color={currentColors.tabIconDefault} />
                                        </Pressable>
                                    </View>
                                    <Text style={styles.itemPrice}>{item.price}</Text>

                                    <View style={styles.quantitySection}>
                                        <View style={[styles.quantityContainer, { borderColor: currentColors.border, borderWidth: 1 }]}>
                                            <Pressable
                                                style={styles.qtyBtn}
                                                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <FontAwesome name="minus" size={10} color={currentColors.text} />
                                            </Pressable>
                                            <Text style={[styles.qtyText, { color: currentColors.text }]}>{item.quantity}</Text>
                                            <Pressable
                                                style={styles.qtyBtn}
                                                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <FontAwesome name="plus" size={10} color={currentColors.text} />
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: currentColors.card }]}>
                            <FontAwesome name="shopping-bag" size={48} color={currentColors.tint} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: currentColors.text }]}>Your bag is empty</Text>
                        <Text style={styles.emptySubtitle}>It looks like you haven't added any items to your selection yet.</Text>
                        <Pressable
                            style={[styles.continueButton, { backgroundColor: currentColors.tint }]}
                            onPress={() => router.push('/(tabs)')}
                        >
                            <Text style={styles.continueText}>Start Exploring</Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>

            {cart.length > 0 && (
                <View style={[styles.footer, { backgroundColor: currentColors.background, borderTopColor: currentColors.border }]}>
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={[styles.summaryValue, { color: currentColors.text }]}>Ksh {totalAmount.toLocaleString()}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Express Shipping</Text>
                            <Text style={[styles.summaryValue, { color: currentColors.text }]}>Ksh 0</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalAmount}>Ksh {totalAmount.toLocaleString()}</Text>
                        </View>
                    </View>
                    <Pressable
                        style={[styles.checkoutBtn, { backgroundColor: currentColors.tint }]}
                        onPress={handleCheckout}
                    >
                        <Text style={styles.checkoutText}>Complete Order</Text>
                        <FontAwesome name="arrow-right" size={16} color="#000" style={{ marginLeft: 8 }} />
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 220,
    },
    cartList: {
        padding: 24,
        backgroundColor: 'transparent',
    },
    cartItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    itemImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#F0F0F0',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 20,
        backgroundColor: 'transparent',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        maxWidth: '85%',
        letterSpacing: -0.5,
    },
    itemPrice: {
        fontSize: 16,
        color: '#C5A028',
        fontWeight: '800',
        marginTop: 4,
    },
    removeBtn: {
        padding: 4,
    },
    quantitySection: {
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        backgroundColor: 'transparent',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    qtyBtn: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: {
        marginHorizontal: 16,
        fontSize: 15,
        fontWeight: '800',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 120,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    emptyTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 24,
    },
    continueButton: {
        marginTop: 40,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
    },
    continueText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 10,
    },
    summaryContainer: {
        marginBottom: 24,
        backgroundColor: 'transparent',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        backgroundColor: 'transparent',
    },
    summaryLabel: {
        fontSize: 15,
        color: '#8E8E93',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: '#8E8E93',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#C5A028',
    },
    checkoutBtn: {
        height: 64,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    checkoutText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
