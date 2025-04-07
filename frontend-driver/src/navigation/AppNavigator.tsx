import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, Text } from 'react-native';
import { authService } from '../services/authServices';

// Screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TripHistoryScreen from '../screens/TripHistoryScreen';
import TripTrackingScreen from '~/screens/TripTrackingScreen';
import { useAuth } from '~/context/AuthContext';
import ConversationScreen from '../screens/ConversationScreen';
import ConversationDetailScreen from '~/screens/ConversationDetailScreen';
import { useNotification } from '~/context/NotificationContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { unreadCount, markAllAsRead } = useNotification();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Trang chủ':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Lịch trình':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            // case 'Lịch sử':
            //   iconName = focused ? 'time' : 'time-outline';
            //   break;
            case 'Thông báo':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Tin nhắn':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'Cá nhân':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00C000',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: 5,
        },
      })}>
      <Tab.Screen name="Trang chủ" component={HomeScreen} />
      <Tab.Screen name="Lịch trình" component={ScheduleScreen} />
      {/* <Tab.Screen name="Lịch sử" component={TripHistoryScreen} /> */}
      {/* <Tab.Screen name="Thông báo" component={NotificationScreen} /> */}
      <Tab.Screen
        name="Thông báo"
        component={NotificationScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#FF3B30' },
        }}
        listeners={{
          tabPress: (e) => {
            // Mark all notifications as read when the tab is pressed
            if (unreadCount > 0) {
              // markAllAsRead();
            }
          },
        }}
      />
      <Tab.Screen name="Tin nhắn" component={ConversationScreen} />
      <Tab.Screen name="Cá nhân" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isLogin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00C000" />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#00C000" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLogin ? 'Home' : 'Login'}
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Login">{(props) => <LoginScreen {...props} />}</Stack.Screen>
        <Stack.Screen name="Home" component={TabNavigator} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="TripTracking" component={TripTrackingScreen} />
        <Stack.Screen name="ConversationDetail" component={ConversationDetailScreen} />
        <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
