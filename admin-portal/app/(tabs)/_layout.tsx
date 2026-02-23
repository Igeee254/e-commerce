import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';

function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#C5A028',
                tabBarInactiveTintColor: '#636366',
                tabBarStyle: {
                    backgroundColor: '#1A1A1E',
                    borderTopColor: '#2C2C2E',
                    height: 62,
                    paddingBottom: 9,
                    paddingTop: 4,
                },
                headerStyle: {
                    backgroundColor: '#1A1A1E',
                },
                headerTitleStyle: {
                    fontWeight: '800',
                    color: '#E8E8ED',
                    fontSize: 17,
                },
                headerShown: false,  // each screen has its own header area
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => <TabBarIcon name="dashboard" color={color} />,
                }}
            />
            <Tabs.Screen
                name="catalog"
                options={{
                    title: 'Products',
                    tabBarIcon: ({ color }) => <TabBarIcon name="shopping-bag" color={color} />,
                }}
            />
            <Tabs.Screen
                name="requests"
                options={{
                    title: 'Requests',
                    tabBarIcon: ({ color }) => <TabBarIcon name="inbox" color={color} />,
                }}
            />
            <Tabs.Screen
                name="users"
                options={{
                    title: 'Users',
                    tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: 'Broadcast',
                    tabBarIcon: ({ color }) => <TabBarIcon name="send" color={color} />,
                }}
            />
            <Tabs.Screen
                name="feedback"
                options={{
                    title: 'Feedback',
                    tabBarIcon: ({ color }) => <TabBarIcon name="comment" color={color} />,
                }}
            />
        </Tabs>
    );
}
