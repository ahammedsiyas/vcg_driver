/**
 * API Configuration
 * Update SERVER_URL based on your environment
 */

// Choose your environment:
// 1. For Android Emulator: 'http://10.0.2.2:5000'
// 2. For iOS Simulator: 'http://127.0.0.1:5000'
// 3. For Physical Device on same network: 'http://<YOUR_MACHINE_IP>:5000'
// 4. For Docker/Production: 'http://172.20.10.6:5000'

export const SERVER_CONFIG = {
  // Development (Android Emulator)
  ANDROID_EMULATOR: 'http://10.0.2.2:5000',
  
  // Development (iOS Simulator)
  IOS_SIMULATOR: 'http://127.0.0.1:5000',
  
  // Development (Physical Device - update with your machine IP)
  PHYSICAL_DEVICE: 'http://172.20.10.6:5000',
  
  // Production/Docker
  PRODUCTION: 'http://3.80.95.96:5000',
  
  // Current active server (change this based on your needs)
  ACTIVE: 'http://3.80.95.96:5000'
};

export default SERVER_CONFIG;
