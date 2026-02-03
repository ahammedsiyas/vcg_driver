import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { updateUser } from '../../store/slices/authSlice';

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.driver);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    vehicleNumber: profile?.vehicleNumber || '',
    vehicleType: profile?.vehicleType || '',
    vehicleCapacity: profile?.vehicleCapacity || '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    try {
      setLoading(true);
      
      // Update user info
      await dispatch(updateUser({ 
        userId: user._id, 
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        }
      })).unwrap();

      // Update driver profile
      // TODO: Add API call to update driver profile

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.firstName}
            onChangeText={(value) => handleChange('firstName', value)}
            placeholder="Enter first name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.lastName}
            onChangeText={(value) => handleChange('lastName', value)}
            placeholder="Enter last name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(value) => handleChange('phone', value)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.sectionTitle}>Vehicle Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vehicle Number</Text>
          <TextInput
            style={styles.input}
            value={formData.vehicleNumber}
            onChangeText={(value) => handleChange('vehicleNumber', value)}
            placeholder="Enter vehicle number"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vehicle Type</Text>
          <TextInput
            style={styles.input}
            value={formData.vehicleType}
            onChangeText={(value) => handleChange('vehicleType', value)}
            placeholder="e.g. Truck, Van"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vehicle Capacity</Text>
          <TextInput
            style={styles.input}
            value={formData.vehicleCapacity}
            onChangeText={(value) => handleChange('vehicleCapacity', value)}
            placeholder="e.g. 10 tons"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  form: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
