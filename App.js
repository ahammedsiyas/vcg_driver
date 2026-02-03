import React, { useState, useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppContent from './src/AppContent';
import LaunchSplashScreen from './src/components/LaunchSplashScreen';

// Hide all development warnings and logs
LogBox.ignoreAllLogs(true);

const App = () => {
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    // Disable Expo development overlay
    if (__DEV__) {
      console.disableYellowBox = true;
    }
  }, []);

  const handleSplashComplete = () => {
    setSplashVisible(false);
  };

  return (
    <Provider store={store}>
      <StatusBar barStyle="light-content" />
      {splashVisible ? (
        <LaunchSplashScreen onSplashComplete={handleSplashComplete} />
      ) : (
        <AppContent />
      )}
    </Provider>
  );
};

export default App;


