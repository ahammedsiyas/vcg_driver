import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { submitOnboarding } from '../../services/driver.service';
import { fetchDriverProfile } from '../../store/slices/driverSlice';
import { logoutUser } from '../../store/slices/authSlice';

const DriverOnboardingScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    licenseNumber: '',
    licenseExpiry: '',
    vehicleNumber: '',
    vehicleType: '',
    vehicleCapacity: '',
  });
  const [licenseUri, setLicenseUri] = useState(null);
  const [rcUri, setRcUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    // Navigation will switch to auth stack after logout
  };

  const pickImage = async (type) => {
    try {
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload your documents. Please enable it in your device settings.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (type === 'license') {
          setLicenseUri(result.assets[0].uri);
        } else if (type === 'rc') {
          setRcUri(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!licenseUri || !rcUri) {
      Alert.alert('Error', 'Please upload both license and RC images');
      return;
    }
    if (!formData.licenseNumber || !formData.licenseExpiry) {
      Alert.alert('Error', 'Please fill in license details (number and expiry)');
      return;
    }
    if (!formData.vehicleNumber || !formData.vehicleType || !formData.vehicleCapacity) {
      Alert.alert('Error', 'Please fill in all vehicle details');
      return;
    }

    setLoading(true);
    try {
      await submitOnboarding({
        licenseNumber: formData.licenseNumber,
        licenseExpiry: formData.licenseExpiry,
        licenseUri,
        rcUri,
        vehicleNumber: formData.vehicleNumber,
        vehicleType: formData.vehicleType,
        vehicleCapacity: formData.vehicleCapacity,
      });
      // Fetch updated profile to get the new approvalStatus
      await dispatch(fetchDriverProfile());
      Alert.alert('Success', 'Your documents are under admin review');
      navigation.replace('PendingApproval');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={loading}>
          <Text style={styles.logoutText}>← Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Driver Onboarding</Text>
      <Text style={styles.subtitle}>Upload your documents and vehicle details</Text>

      {/* License Image */}
      <View style={styles.section}>
        <Text style={styles.label}>Driving License Photo *</Text>
        {licenseUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: licenseUri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setLicenseUri(null)}
              disabled={loading}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickImage('license')}
            disabled={loading}
          >
            <Text style={styles.uploadButtonText}>📷 Upload License</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* RC Image */}
      <View style={styles.section}>
        <Text style={styles.label}>Registration Certificate (RC) Photo *</Text>
        {rcUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: rcUri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setRcUri(null)}
              disabled={loading}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickImage('rc')}
            disabled={loading}
          >
            <Text style={styles.uploadButtonText}>📷 Upload RC</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* License Details */}
      <View style={styles.section}>
        <Text style={styles.label}>License Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., DL0012345678"
          value={formData.licenseNumber}
          onChangeText={(text) => setFormData({ ...formData, licenseNumber: text })}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>License Expiry Date *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 2030-12-31 or 12/31/2030"
          value={formData.licenseExpiry}
          onChangeText={(text) => setFormData({ ...formData, licenseExpiry: text })}
          editable={!loading}
        />
      </View>

      {/* Vehicle Details */}
      <View style={styles.section}>
        <Text style={styles.label}>Vehicle Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., DL-01-AA-1234"
          value={formData.vehicleNumber}
          onChangeText={(text) => setFormData({ ...formData, vehicleNumber: text })}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Vehicle Type *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Truck, Van, SUV"
          value={formData.vehicleType}
          onChangeText={(text) => setFormData({ ...formData, vehicleType: text })}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Vehicle Capacity *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 5 tons, 1000 kg"
          value={formData.vehicleCapacity}
          onChangeText={(text) => setFormData({ ...formData, vehicleCapacity: text })}
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit for Approval</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  removeButton: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#ff4444',
    borderRadius: 6,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DriverOnboardingScreen;
