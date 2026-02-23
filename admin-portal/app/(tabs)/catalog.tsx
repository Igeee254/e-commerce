import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { API_BASE_URL } from '../../constants/API';

interface Product {
    id: string;
    name: string;
    price: string;
    category: string;
    image: string;
    description?: string;
    stock?: number;
}

type TabMode = 'add' | 'restock';

export default function CatalogScreen() {
    // ── Add new product state ──
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Restock state ──
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [stockQty, setStockQty] = useState(1);
    const [isRestocking, setIsRestocking] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    // ── Shared ──
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabMode>('add');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    // ─────── Image pickers ───────
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission Denied', 'Camera roll access is needed.'); return; }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 1,
        });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission Denied', 'Camera access is needed.'); return; }
        const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 1 });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    // ─────── Fetch ───────
    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/products`, { headers: { 'bypass-tunnel-reminder': 'true' } });
            if (response.ok) setProducts(await response.json());
        } catch (error) {
            console.error('Fetch products error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ─────── Add product ───────
    const handleAddProduct = async () => {
        if (!name || !price || !category || !image) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
                body: JSON.stringify({ name, price: parseInt(price), category, image, description }),
            });
            if (!response.ok) throw new Error('Failed to add product');
            Alert.alert('Success', `"${name}" added to the catalog!`);
            setName(''); setPrice(''); setImage(''); setDescription(''); setCategory('');
            fetchProducts();
        } catch (error) {
            Alert.alert('Error', 'Could not add product.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─────── Delete product ───────
    const handleDelete = (product: Product) => {
        Alert.alert('Delete Product', `Remove "${product.name}" from the catalog?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await fetch(`${API_BASE_URL}/products/${product.id}`, {
                            method: 'DELETE', headers: { 'bypass-tunnel-reminder': 'true' },
                        });
                        fetchProducts();
                    } catch (e) {
                        Alert.alert('Error', 'Could not delete product.');
                    }
                }
            },
        ]);
    };

    // ─────── Restock ───────
    const handleRestock = async () => {
        if (!selectedProduct) { Alert.alert('Error', 'Select a product first.'); return; }
        setIsRestocking(true);
        try {
            const res = await fetch(`${API_BASE_URL}/products/${selectedProduct.id}/stock`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
                body: JSON.stringify({ stock: stockQty }),
            });
            if (!res.ok) throw new Error('Failed');
            Alert.alert('Success', `Stock for "${selectedProduct.name}" set to ${stockQty} units.`);
            setSelectedProduct(null); setStockQty(1); setProductSearch('');
            fetchProducts();
        } catch (e) {
            Alert.alert('Error', 'Could not update stock.');
        } finally {
            setIsRestocking(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Tab Toggle */}
                <View style={styles.tabRow}>
                    <Pressable
                        style={[styles.tab, activeTab === 'add' && styles.tabActive]}
                        onPress={() => setActiveTab('add')}
                    >
                        <FontAwesome name="plus" size={14} color={activeTab === 'add' ? '#000' : '#8E8E93'} />
                        <Text style={[styles.tabText, activeTab === 'add' && styles.tabTextActive]}>
                            New Product
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tab, activeTab === 'restock' && styles.tabActive]}
                        onPress={() => setActiveTab('restock')}
                    >
                        <FontAwesome name="refresh" size={14} color={activeTab === 'restock' ? '#000' : '#8E8E93'} />
                        <Text style={[styles.tabText, activeTab === 'restock' && styles.tabTextActive]}>
                            Restock Existing
                        </Text>
                    </Pressable>
                </View>

                {/* ─── ADD NEW PRODUCT ─── */}
                {activeTab === 'add' && (
                    <View style={styles.form}>
                        <Text style={styles.sectionHeading}>Add New Product</Text>

                        <Text style={styles.label}>Product Name *</Text>
                        <TextInput style={styles.input} placeholder="e.g. Minimalist Oak Chair" placeholderTextColor="#636366" value={name} onChangeText={setName} />

                        <Text style={styles.label}>Price (Ksh) *</Text>
                        <TextInput style={styles.input} placeholder="e.g. 15000" placeholderTextColor="#636366" keyboardType="numeric" value={price} onChangeText={setPrice} />

                        <Text style={styles.label}>Category *</Text>
                        <TextInput style={styles.input} placeholder="e.g. Seating" placeholderTextColor="#636366" value={category} onChangeText={setCategory} />

                        <Text style={styles.label}>Product Image *</Text>
                        <View style={styles.imageRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                placeholder="Paste image URL or capture"
                                placeholderTextColor="#636366"
                                value={image}
                                onChangeText={setImage}
                            />
                            <Pressable style={styles.iconBtn} onPress={takePhoto}>
                                <FontAwesome name="camera" size={18} color="#C5A028" />
                            </Pressable>
                            <Pressable style={styles.iconBtn} onPress={pickImage}>
                                <FontAwesome name="image" size={18} color="#C5A028" />
                            </Pressable>
                        </View>

                        {!!image && (
                            <View style={styles.previewWrap}>
                                <Image source={{ uri: image }} style={styles.previewImg} />
                                <Pressable style={styles.removeImg} onPress={() => setImage('')}>
                                    <FontAwesome name="times-circle" size={22} color="#FF3B30" />
                                </Pressable>
                            </View>
                        )}

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe the piece..."
                            placeholderTextColor="#636366"
                            multiline numberOfLines={4}
                            value={description} onChangeText={setDescription}
                        />

                        <Pressable style={[styles.submitBtn, { opacity: isSubmitting ? 0.7 : 1 }]} onPress={handleAddProduct} disabled={isSubmitting}>
                            <Text style={styles.submitBtnText}>{isSubmitting ? 'Adding...' : 'Add to Catalog'}</Text>
                        </Pressable>
                    </View>
                )}

                {/* ─── RESTOCK EXISTING ─── */}
                {activeTab === 'restock' && (
                    <View style={styles.form}>
                        <Text style={styles.sectionHeading}>Restock an Existing Product</Text>
                        <Text style={styles.hint}>
                            Pick a product from the list and set its new stock quantity using the +/- controls.
                        </Text>

                        {/* Search */}
                        <View style={styles.searchRow}>
                            <FontAwesome name="search" size={15} color="#636366" style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search products..."
                                placeholderTextColor="#636366"
                                value={productSearch}
                                onChangeText={setProductSearch}
                            />
                        </View>

                        {/* Product picker list */}
                        {isLoading ? (
                            <ActivityIndicator color="#C5A028" style={{ marginTop: 16 }} />
                        ) : (
                            <View style={styles.pickList}>
                                {filteredProducts.map(p => (
                                    <Pressable
                                        key={p.id}
                                        style={[
                                            styles.pickItem,
                                            selectedProduct?.id === p.id && styles.pickItemSelected,
                                        ]}
                                        onPress={() => setSelectedProduct(p)}
                                    >
                                        <Image source={{ uri: p.image }} style={styles.pickThumb} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.pickName}>{p.name}</Text>
                                            <Text style={styles.pickSub}>{p.category} · Ksh {p.price}</Text>
                                        </View>
                                        {selectedProduct?.id === p.id && (
                                            <FontAwesome name="check-circle" size={20} color="#C5A028" />
                                        )}
                                    </Pressable>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <Text style={styles.noResults}>No products found</Text>
                                )}
                            </View>
                        )}

                        {/* Quantity stepper */}
                        {!!selectedProduct && (
                            <View style={styles.stepperSection}>
                                <Text style={styles.label}>Stock Quantity for "{selectedProduct.name}"</Text>
                                <View style={styles.stepper}>
                                    <Pressable
                                        style={styles.stepBtn}
                                        onPress={() => setStockQty(q => Math.max(0, q - 1))}
                                    >
                                        <FontAwesome name="minus" size={18} color="#E8E8ED" />
                                    </Pressable>
                                    <View style={styles.stepValueWrap}>
                                        <Text style={styles.stepValue}>{stockQty}</Text>
                                        <Text style={styles.stepUnit}>units</Text>
                                    </View>
                                    <Pressable
                                        style={styles.stepBtn}
                                        onPress={() => setStockQty(q => q + 1)}
                                    >
                                        <FontAwesome name="plus" size={18} color="#E8E8ED" />
                                    </Pressable>
                                </View>

                                {/* Quick preset buttons */}
                                <View style={styles.presets}>
                                    {[5, 10, 20, 50, 100].map(n => (
                                        <Pressable key={n} style={styles.presetBtn} onPress={() => setStockQty(n)}>
                                            <Text style={styles.presetText}>{n}</Text>
                                        </Pressable>
                                    ))}
                                </View>

                                <Pressable
                                    style={[styles.submitBtn, { opacity: isRestocking ? 0.7 : 1 }]}
                                    onPress={handleRestock}
                                    disabled={isRestocking}
                                >
                                    <Text style={styles.submitBtnText}>
                                        {isRestocking ? 'Updating...' : `Set Stock to ${stockQty}`}
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                )}

                {/* ─── EXISTING PRODUCTS LIST ─── */}
                <View style={styles.listSection}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>Catalog</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{products.length}</Text>
                        </View>
                        <Pressable onPress={fetchProducts} style={{ marginLeft: 'auto' }}>
                            <FontAwesome name="refresh" size={16} color="#C5A028" />
                        </Pressable>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator color="#C5A028" style={{ marginTop: 20 }} />
                    ) : (
                        products.map(item => (
                            <View key={item.id} style={styles.productCard}>
                                <Image source={{ uri: item.image }} style={styles.productThumb} />
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName}>{item.name}</Text>
                                    <Text style={styles.productSub}>{item.category}</Text>
                                </View>
                                <View style={styles.productRight}>
                                    <Text style={styles.productPrice}>Ksh {item.price}</Text>
                                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                                        <FontAwesome name="trash" size={15} color="#FF453A" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F11' },
    scrollContent: { padding: 20, paddingTop: 56, paddingBottom: 60 },

    tabRow: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1E',
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 10, borderRadius: 12,
    },
    tabActive: { backgroundColor: '#C5A028' },
    tabText: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },
    tabTextActive: { color: '#000' },

    sectionHeading: { fontSize: 20, fontWeight: '800', color: '#E8E8ED', marginBottom: 4 },
    hint: { fontSize: 13, color: '#8E8E93', marginBottom: 20, lineHeight: 19 },

    form: { gap: 14, marginBottom: 8 },
    label: { fontSize: 11, fontWeight: '700', color: '#C5A028', textTransform: 'uppercase', letterSpacing: 1 },
    input: {
        height: 52, borderRadius: 14, paddingHorizontal: 16, fontSize: 15,
        backgroundColor: '#1A1A1E', color: '#E8E8ED', borderWidth: 1, borderColor: '#2C2C2E',
    },
    textArea: { height: 100, paddingTop: 14, textAlignVertical: 'top' },
    imageRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    iconBtn: {
        width: 52, height: 52, borderRadius: 14,
        backgroundColor: '#1A1A1E', justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#2C2C2E',
    },
    previewWrap: {
        height: 180, borderRadius: 14, overflow: 'hidden',
        backgroundColor: '#1A1A1E', borderWidth: 1, borderColor: '#2C2C2E', position: 'relative',
    },
    previewImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    removeImg: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },
    submitBtn: {
        height: 56, borderRadius: 14, backgroundColor: '#C5A028',
        justifyContent: 'center', alignItems: 'center', marginTop: 8,
    },
    submitBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },

    // Restock
    searchRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1A1A1E', borderRadius: 14, paddingHorizontal: 14,
        borderWidth: 1, borderColor: '#2C2C2E', height: 48,
    },
    searchInput: { flex: 1, color: '#E8E8ED', fontSize: 14 },
    pickList: { gap: 8, marginBottom: 4 },
    pickItem: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#1A1A1E', borderRadius: 12, padding: 12,
        borderWidth: 1, borderColor: '#2C2C2E',
    },
    pickItemSelected: { borderColor: '#C5A028', backgroundColor: 'rgba(197,160,40,0.08)' },
    pickThumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#2C2C2E' },
    pickName: { color: '#E8E8ED', fontSize: 14, fontWeight: '700' },
    pickSub: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
    noResults: { color: '#636366', textAlign: 'center', marginTop: 16, fontSize: 14 },

    stepperSection: { gap: 14, marginTop: 8 },
    stepper: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#1A1A1E', borderRadius: 20, overflow: 'hidden',
        borderWidth: 1, borderColor: '#2C2C2E', height: 72,
    },
    stepBtn: {
        width: 72, height: 72, justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#2C2C2E',
    },
    stepValueWrap: { flex: 1, alignItems: 'center' },
    stepValue: { fontSize: 36, fontWeight: '900', color: '#E8E8ED' },
    stepUnit: { fontSize: 11, color: '#8E8E93', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

    presets: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    presetBtn: {
        paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#1A1A1E', borderWidth: 1, borderColor: '#2C2C2E',
    },
    presetText: { color: '#C5A028', fontSize: 14, fontWeight: '700' },

    // Catalog list
    listSection: { marginTop: 36, paddingBottom: 20 },
    listHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    listTitle: { fontSize: 20, fontWeight: '800', color: '#E8E8ED' },
    countBadge: {
        backgroundColor: '#C5A028', borderRadius: 10,
        paddingHorizontal: 8, paddingVertical: 2,
    },
    countText: { color: '#000', fontSize: 12, fontWeight: '800' },
    productCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1A1A1E', borderRadius: 12, padding: 12,
        marginBottom: 8, borderWidth: 1, borderColor: '#2C2C2E',
    },
    productThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#2C2C2E' },
    productInfo: { flex: 1, marginLeft: 12 },
    productName: { color: '#E8E8ED', fontSize: 14, fontWeight: '700' },
    productSub: { color: '#8E8E93', fontSize: 11, marginTop: 2 },
    productRight: { alignItems: 'flex-end', gap: 8 },
    productPrice: { color: '#C5A028', fontSize: 13, fontWeight: '800' },
    deleteBtn: {
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: 'rgba(255,69,58,0.1)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,69,58,0.2)',
    },
});
