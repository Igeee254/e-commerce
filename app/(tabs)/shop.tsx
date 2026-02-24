import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { API_BASE_URL } from '@/constants/API';
import { Colors } from '@/constants/Colors';
import { Product } from '@/constants/mockData';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'expo-router';

export default function ShopScreen() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isRequesting, setIsRequesting] = useState(false);
  const PAGE_SIZE = 20;

  const { addToCart } = useCart();
  const { isLoggedIn, userEmail } = useAuth();
  const router = useRouter();

  const currentColors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  // When category changes, reset products and fetch fresh
  useEffect(() => {
    resetAndFetch(selectedCategory);
  }, [selectedCategory]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch categories (once)
      const catRes = await fetch(`${API_BASE_URL}/categories`, { headers: { 'bypass-tunnel-reminder': 'true' } });
      const cats = await catRes.json();
      setCategories(['All', ...cats]);

      // 2. Fetch first batch of products
      await resetAndFetch(selectedCategory);
    } catch (error) {
      console.error("Initial fetch error:", error);
      Alert.alert("Connection Error", "Could not connect to the Alpha Smart server.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndFetch = async (cat: string) => {
    setIsLoading(true);
    setOffset(0);
    setHasMore(true);
    try {
      const prodRes = await fetch(
        `${API_BASE_URL}/products?category=${encodeURIComponent(cat)}&limit=${PAGE_SIZE}&offset=0`,
        { headers: { 'bypass-tunnel-reminder': 'true' } }
      );
      const prods = await prodRes.json();
      setAllProducts(prods);
      if (prods.length < PAGE_SIZE) setHasMore(false);
    } catch (error) {
      console.error("Product fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (!hasMore || isLoading) return;

    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);

    try {
      const prodRes = await fetch(
        `${API_BASE_URL}/products?category=${encodeURIComponent(selectedCategory)}&limit=${PAGE_SIZE}&offset=${newOffset}`,
        { headers: { 'bypass-tunnel-reminder': 'true' } }
      );
      const prods = await prodRes.json();

      if (prods.length === 0) {
        setHasMore(false);
      } else {
        setAllProducts((prev: Product[]) => [...prev, ...prods]);
        if (prods.length < PAGE_SIZE) setHasMore(false);
      }
    } catch (error) {
      console.error("Load more error:", error);
    }
  };

  const handleRequestItem = async () => {
    if (!searchQuery.trim() || !userEmail) return;

    setIsRequesting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true'
        },
        body: JSON.stringify({
          item_name: searchQuery,
          user_email: userEmail
        })
      });

      if (response.ok) {
        Alert.alert('Request Sent', `We've noted your request for "${searchQuery}". We'll notify you once it's available!`);
        setSearchQuery('');
      } else {
        throw new Error('Failed to send request');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not send request. Please try again later.');
    } finally {
      setIsRequesting(false);
    }
  };

  const filteredProducts = allProducts.filter((p: Product) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const searchBarTranslateY = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const currentOffset = contentOffset.y;
    const diff = currentOffset - lastScrollY.current;

    // Detect if we're near the bottom to load more
    const isCloseToBottom = layoutMeasurement.height + currentOffset >= contentSize.height - 200;
    if (isCloseToBottom && hasMore && !isLoading) {
      loadMoreProducts();
    }

    if (currentOffset <= 0) {
      Animated.spring(searchBarTranslateY, { toValue: 0, useNativeDriver: false, bounciness: 0 }).start();
    } else if (diff > 5) {
      Animated.spring(searchBarTranslateY, { toValue: -160, useNativeDriver: false, bounciness: 0 }).start();
    } else if (diff < -5) {
      Animated.spring(searchBarTranslateY, { toValue: 0, useNativeDriver: false, bounciness: 0 }).start();
    }

    lastScrollY.current = currentOffset;
  };

  const isLargeScreen = width > 768;
  const numColumns = isLargeScreen ? 5 : 3;

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <Animated.View style={[
        styles.headerWrapper,
        { transform: [{ translateY: searchBarTranslateY }] }
      ]}>
        <View style={styles.header}>
          <View style={[styles.searchContainer, { backgroundColor: currentColors.card, borderColor: currentColors.border, borderWidth: 1, flex: 1 }]}>
            <FontAwesome name="search" size={16} color={currentColors.tabIconDefault} style={styles.searchIcon} />
            <TextInput
              placeholder="Search our collection..."
              placeholderTextColor={currentColors.tabIconDefault}
              style={[styles.searchInput, { color: currentColors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {!isLoggedIn && (
            <Pressable
              style={[styles.signupIconButton, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}
              onPress={() => router.push('/(auth)/register')}
            >
              <FontAwesome name="user-plus" size={18} color="#C5A028" />
            </Pressable>
          )}
        </View>

        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            {categories.map((cat: string) => (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryChip,
                  { borderColor: currentColors.border },
                  selectedCategory === cat && { backgroundColor: currentColors.tint, borderColor: currentColors.tint }
                ]}
              >
                <Text style={[
                  styles.categoryChipText,
                  { color: currentColors.text },
                  selectedCategory === cat && { color: '#000' }
                ]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={{ height: 160 }} />

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={currentColors.tint} />
            <Text style={styles.loaderText}>Curating your collection...</Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((prod) => (
                <View key={prod.id} style={[styles.productItem, { width: `${(100 / numColumns) - 2}%` }]}>
                  <View style={[styles.imageContainer, { backgroundColor: currentColors.card, borderColor: currentColors.border, borderWidth: 1 }]}>
                    <Pressable onPress={() => router.push({ pathname: '/product/[id]', params: { id: prod.id } })}>
                      <Image source={{ uri: prod.image }} style={styles.productImage} />
                    </Pressable>
                    <Pressable
                      style={[styles.addButton, { backgroundColor: currentColors.tint }]}
                      onPress={() => {
                        addToCart({ id: prod.id, name: prod.name, price: prod.price, image: prod.image });
                        Alert.alert('Success', `${prod.name} added to cart!`);
                      }}
                    >
                      <FontAwesome name="plus" size={12} color="#fff" />
                    </Pressable>
                  </View>
                  <View style={styles.productDetails}>
                    <Text style={[styles.productName, { color: currentColors.text }]} numberOfLines={1}>{prod.name}</Text>
                    <Text style={styles.productPrice}>{prod.price}</Text>
                  </View>
                </View>
              ))
            ) : searchQuery.trim() !== '' ? (
              <View style={styles.emptySearchContainer}>
                <FontAwesome name="search-minus" size={48} color="#636366" />
                <Text style={[styles.emptySearchTitle, { color: currentColors.text }]}>No matching items</Text>
                <Text style={styles.emptySearchSubtitle}>
                  We couldn't find "{searchQuery}" in our collection. Would you like to request it?
                </Text>
                <Pressable
                  style={[styles.requestButton, { backgroundColor: currentColors.tint, opacity: isRequesting ? 0.7 : 1 }]}
                  onPress={handleRequestItem}
                  disabled={isRequesting}
                >
                  <Text style={styles.requestButtonText}>
                    {isRequesting ? 'Requesting...' : 'Request this Item'}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.emptySearchContainer}>
                <Text style={styles.emptySearchSubtitle}>Start searching to see products.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 24,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingLeft: 24,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  productItem: {
    marginBottom: 28,
    backgroundColor: 'transparent',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#F0F0F0',
  },
  addButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  productDetails: {
    marginTop: 12,
    backgroundColor: 'transparent',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  productPrice: {
    fontSize: 12,
    color: '#C5A028',
    fontWeight: '800',
    marginTop: 2,
  },
  loaderContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  signupIconButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
  },
  emptySearchContainer: {
    width: '100%',
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySearchTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySearchSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 250,
    lineHeight: 20,
  },
  requestButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  requestButtonText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 14,
  },
});
