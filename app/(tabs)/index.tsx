import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import ScrollTopButton from '@/components/ScrollTopButton';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { API_BASE_URL } from '@/constants/API';
import { Colors } from '@/constants/Colors';
import { Product } from '@/constants/mockData';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<string[]>([]);
  const [featuredItems, setFeaturedItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`),
        fetch(`${API_BASE_URL}/categories`)
      ]);

      const prods = await prodRes.json();
      const cats = await catRes.json();

      setFeaturedItems(prods.slice(0, 8));
      // Backend may return [{id, name}] objects or plain strings — normalise to strings
      const catNames: string[] = Array.isArray(cats)
        ? cats.map((c: any) => (typeof c === 'string' ? c : c?.name ?? String(c)))
        : [];
      setCategories(catNames);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const heroHeight = isLargeScreen ? 600 : 450;

  const heroImageScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.2, 1, 1],
    extrapolate: 'clamp',
  });

  const heroOverlayOpacity = scrollY.interpolate({
    inputRange: [0, heroHeight / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, heroHeight],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const currentColors = Colors[colorScheme ?? 'light'];

  const catIcons: Record<string, string> = {
    'Furniture': 'chair',
    'Electronics': 'laptop',
    'Decor': 'paint-brush',
    'Toys': 'gamepad',
    'Fashion': 'tags',
    'Sports': 'soccer-ball-o',
    'Kitchen': 'cutlery',
    'Wellness': 'heartbeat',
    'Art': 'image'
  };

  const getCatIcon = (name: string) => catIcons[name] || 'circle';

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        ref={scrollRef}
        style={[styles.container, { backgroundColor: currentColors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <Animated.View style={[
          styles.heroContainer,
          isLargeScreen && styles.heroContainerLarge,
          { transform: [{ translateY: heroTranslateY }] }
        ]}>
          {!isLoggedIn && (
            <Pressable
              style={styles.signupIconHeader}
              onPress={() => router.push('/(auth)/register')}
            >
              <FontAwesome name="user-plus" size={20} color="#C5A028" />
              <Text style={styles.signupIconText}>JOIN</Text>
            </Pressable>
          )}
          <Animated.Image
            source={{ uri: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200' }}
            style={[styles.heroImage, { transform: [{ scale: heroImageScale }] }]}
          />
          <Animated.View style={[styles.heroOverlay, { opacity: heroOverlayOpacity }]}>
            <Text style={styles.heroSubtitle}>Premium Selection</Text>
            <Text style={styles.heroTitle}>The Art of Modern Living</Text>
            <Pressable
              style={({ pressed }) => [
                styles.heroButton,
                { opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={() => router.push('/shop')}
            >
              <Text style={styles.heroButtonText}>Explore Now</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Categories</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {isLoading ? (
              <ActivityIndicator color={currentColors.tint} style={{ marginLeft: 20 }} />
            ) : (
              categories.filter((c: string) => c !== 'All').map((cat: string) => (
                <Pressable
                  key={cat}
                  style={styles.categoryItem}
                  onPress={() => router.push('/shop')}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: currentColors.card, borderColor: currentColors.border, borderWidth: 1 }]}>
                    {/* @ts-ignore */}
                    <FontAwesome name={getCatIcon(cat)} size={20} color={currentColors.tint} />
                  </View>
                  <Text style={[styles.categoryName, { color: currentColors.text }]}>{cat}</Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Featured Items</Text>
            <Pressable onPress={() => router.push('/shop')}>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={currentColors.tint} />
            </View>
          ) : (
            <View style={[styles.productsGrid, isLargeScreen && styles.productsGridLarge]}>
              {featuredItems.map((prod) => (
                <Pressable
                  key={prod.id}
                  style={[
                    styles.productCard,
                    { backgroundColor: currentColors.card, borderColor: currentColors.border, borderWidth: 1 },
                    isLargeScreen && { width: '23%' }
                  ]}
                  onPress={() => router.push({ pathname: '/product/[id]', params: { id: prod.id } })}
                >
                  <Image source={{ uri: prod.image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={[styles.prodName, { color: currentColors.text }]} numberOfLines={1}>{prod.name}</Text>
                    <Text style={styles.prodPrice}>{prod.price}</Text>
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
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>
      <ScrollTopButton
        scrollY={scrollY}
        onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  heroContainer: {
    height: 450,
    width: '100%',
    position: 'relative',
  },
  heroContainerLarge: {
    height: 600,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 32,
  },
  heroSubtitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 12,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 32,
    maxWidth: '90%',
    lineHeight: 52,
  },
  heroButton: {
    backgroundColor: '#C5A028',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
  },
  section: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  viewAll: {
    color: '#C5A028',
    fontSize: 14,
    fontWeight: '700',
  },
  categoriesScroll: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: 'transparent',
  },
  categoryIcon: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    backgroundColor: 'transparent',
  },
  productsGridLarge: {
    flexDirection: 'row',
  },
  productCard: {
    width: '31%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#F0F0F0',
  },
  productInfo: {
    padding: 16,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  prodName: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  prodPrice: {
    fontSize: 12,
    color: '#C5A028',
    fontWeight: '800',
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
  signupIconHeader: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,26,30,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C5A028',
  },
  signupIconText: {
    color: '#C5A028',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 1,
  },
});
