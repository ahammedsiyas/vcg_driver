import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import TripsScreen from '../screens/loads/TripsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AvailableBookingsScreen from '../screens/loads/AvailableBookingsScreen';

const Tab = createBottomTabNavigator();

const tabIcon = (glyph, focused) => (
  <Text style={{ fontSize: 18, color: focused ? '#1976D2' : '#6b7280', marginBottom: -2 }}>{glyph}</Text>
);

const DriverTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1976D2',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          height: 72,
          paddingBottom: 14,
          paddingTop: 10,
          borderTopWidth: 0.5,
          borderTopColor: '#e5e7eb',
          backgroundColor: '#fff',
        }
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component= {HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => tabIcon('🏠', focused),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? '#1976D2' : '#6b7280', fontWeight: focused ? '700' : '600', fontSize: 12 }}>
              Home
            </Text>
          )
        }}
      />
      <Tab.Screen
        name="TripsTab"
        component={TripsScreen}
        options={{
          title: 'Trips',
          tabBarIcon: ({ focused }) => tabIcon('🚚', focused),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? '#1976D2' : '#6b7280', fontWeight: focused ? '700' : '600', fontSize: 12 }}>
              Trips
            </Text>
          )
        }}
      />

      <Tab.Screen
        name="BookingsTab"
        component={AvailableBookingsScreen}
        options={{
          title: 'Available Loads',
          tabBarIcon: ({ focused }) => tabIcon('📦', focused),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? '#1976D2' : '#6b7280', fontWeight: focused ? '700' : '600', fontSize: 12 }}>
              Loads
            </Text>
          )
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => tabIcon('👤', focused),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? '#1976D2' : '#6b7280', fontWeight: focused ? '700' : '600', fontSize: 12 }}>
              Profile
            </Text>
          )
        }}
      />
    </Tab.Navigator>
  );
};

export default DriverTabs;
