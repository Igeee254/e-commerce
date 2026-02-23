import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { StyleSheet, Text, View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { totalItems } = useCart();
  const { isLoggedIn, userName } = useAuth();
  const currentColors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const getInitial = (name: string | null) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const HeaderRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
      <Link href="/notifications" asChild>
        <Pressable>
          {({ pressed }) => (
            <FontAwesome
              name="bell-o"
              size={22}
              color={currentColors.text}
              style={{ marginRight: 16, opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>
      </Link>

      {isLoggedIn ? (
        <Pressable onPress={() => router.push('/(tabs)/profile')}>
          {({ pressed }) => (
            <View style={[styles.avatarContainer, { opacity: pressed ? 0.7 : 1 }]}>
              <Text style={styles.avatarText}>{getInitial(userName)}</Text>
            </View>
          )}
        </Pressable>
      ) : (
        <Pressable onPress={() => router.push('/(auth)/login')}>
          {({ pressed }) => (
            <View style={[styles.loginHint, { backgroundColor: currentColors.card, borderColor: currentColors.border, opacity: pressed ? 0.7 : 1 }]}>
              <FontAwesome name="sign-in" size={18} color="#C5A028" />
            </View>
          )}
        </Pressable>
      )}
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: currentColors.tint,
        tabBarInactiveTintColor: currentColors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: currentColors.background,
          borderTopColor: currentColors.border,
          height: 60,
          paddingBottom: 8,
        },
        headerShown: useClientOnlyValue(false, true),
        headerStyle: {
          backgroundColor: currentColors.background,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 20,
          color: currentColors.text,
        },
        headerRight: () => <HeaderRight />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Alpha Smart',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Collection',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-bag" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Bag',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} />,
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].tint,
            color: '#000',
            fontSize: 10,
            fontWeight: 'bold',
          }
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <TabBarIcon name="list-alt" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Updates',
          tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user-circle" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C5A028',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
  loginHint: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
