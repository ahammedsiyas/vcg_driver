import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainNavigator from './navigation/MainNavigator';
import { checkAuth } from './store/slices/authSlice';
import { fetchDriverProfile } from './store/slices/driverSlice';
import { Alert } from 'react-native';

const AppContent = () => {
  const dispatch = useDispatch();
  const [isAuthChecking, setIsAuthChecking] = React.useState(true);
  const [driverChecked, setDriverChecked] = React.useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { loading: driverLoading, profile } = useSelector((state) => state.driver);
  const prevStatus = useRef();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('[APP] Starting auth check...');
        await dispatch(checkAuth());
        console.log('[APP] Auth check complete. isAuthenticated:', isAuthenticated);
      } catch (error) {
        console.error('[APP] Auth check error:', error);
      } finally {
        setIsAuthChecking(false);
      }
    };
    verifyAuth();
  }, [dispatch]);

  // Fetch driver profile when authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthChecking) {
      dispatch(fetchDriverProfile()).finally(() => setDriverChecked(true));
    }
    if (!isAuthenticated && !isAuthChecking) {
      setDriverChecked(true);
    }
  }, [isAuthenticated, isAuthChecking, dispatch]);

  // Show notification on approvalStatus change
  useEffect(() => {
    if (!profile) return;
    if (prevStatus.current && prevStatus.current !== profile.approvalStatus) {
      if (profile.approvalStatus === 'approved') {
        Alert.alert('Approved', 'Your profile has been approved by admin.');
      } else if (profile.approvalStatus === 'rejected') {
        Alert.alert('Rejected', 'Your profile was rejected by admin. Please reapply with correct documents.');
      }
    }
    prevStatus.current = profile?.approvalStatus;
  }, [profile?.approvalStatus]);

  const clearStorage = async () => {
    console.log('[APP] Clearing AsyncStorage...');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    await dispatch(checkAuth());
  };

  if (isAuthChecking || (isAuthenticated && (!driverChecked || driverLoading))) {
    return null; // LaunchSplashScreen handles initial loading in App.js
  }

  return <MainNavigator />;
};

export default AppContent;
