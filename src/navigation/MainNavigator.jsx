import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import DriverOnboardingScreen from '../screens/onboarding/DriverOnboardingScreen';
import PendingApprovalScreen from '../screens/onboarding/PendingApprovalScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import EditLicenseScreen from '../screens/profile/EditLicenseScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import AssignedTripsScreen from '../screens/loads/AssignedTripsScreen';
import TripTrackingScreen from '../screens/loads/TripTrackingScreen';
import AvailableBookingsScreen from '../screens/loads/AvailableBookingsScreen';
import RateConfirmationsScreen from '../screens/loads/RateConfirmationsScreen';
import DriverTabs from './DriverTabs';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.driver);

  // Determine which home screen to show based on driver status
  const getInitialScreen = () => {
    if (!profile) return 'DriverOnboarding';

    if (profile.approvalStatus === 'approved') {
      return 'DriverTabs';
    } else if (profile.approvalStatus === 'pending') {
      return 'PendingApproval';
    } else if (profile.approvalStatus === 'incomplete') {
      return 'DriverOnboarding';
    }
    return 'DriverOnboarding';
  };

  const initialScreen = getInitialScreen();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={!isAuthenticated ? 'Login' : initialScreen}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1976D2'
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold'
          }
        }}
      >
        {!isAuthenticated ? (
          <>
            {/* Auth Screens */}
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ title: 'Forgot Password' }}
            />
          </>
        ) : (
          <>
            {/* Driver Tabs */}
            <Stack.Screen
              name="DriverTabs"
              component={DriverTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DriverOnboarding"
              component={DriverOnboardingScreen}
              options={{ title: 'Onboarding', headerBackVisible: false }}
            />
            <Stack.Screen
              name="PendingApproval"
              component={PendingApprovalScreen}
              options={{ title: 'Pending Approval', headerBackVisible: false }}
            />
            
            {/* Trip Screens */}
            <Stack.Screen
              name="AssignedTrips"
              component={AssignedTripsScreen}
              options={{ title: 'Assigned Trips' }}
            />
            <Stack.Screen
              name="TripTracking"
              component={TripTrackingScreen}
              options={{ title: 'Trip Tracking' }}
            />

            <Stack.Screen
              name="AvailableBookings"
              component={AvailableBookingsScreen}
              options={{ title: 'Available Bookings' }}
            />
            <Stack.Screen
              name="RateConfirmations"
              component={RateConfirmationsScreen}
              options={{ title: 'Rate Confirmations' }}
            />
            
            {/* Profile Screens - Available to all authenticated drivers */}
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'My Profile' }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EditLicense"
              component={EditLicenseScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
