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
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditLicenseScreen = ({ navigation }) => {
  const { profile } = useSelector((state) => state.driver);

  const [formData, setFormData] = useState({
    licenseNumber: profile?.licenseNumber || '',
    licenseExpiry: profile?.licenseExpiry ? new Date(profile.licenseExpiry) : new Date(),
  });

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleChange('licenseExpiry', selectedDate);
    }
  };

  const handleSave = async () => {
    if (!formData.licenseNumber.trim()) {
      Alert.alert('Error', 'License number is required');
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Add API call to update license info
      // await driverService.updateLicenseInfo(profile._id, formData);

      Alert.alert('Success', 'License information updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update license info');
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
        <Text style={styles.headerTitle}>Edit License Info</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>License Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.licenseNumber}
            onChangeText={(value) => handleChange('licenseNumber', value)}
            placeholder="Enter license number"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>License Expiry *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formData.licenseExpiry.toLocaleDateString()}
            </Text>
            <MaterialIcons name="calendar-today" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.licenseExpiry}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <View style={styles.noteContainer}>
          <MaterialIcons name="info" size={20} color="#666" style={styles.noteIcon} />
          <Text style={styles.noteText}>
            To update license or RC images, please contact support or re-upload through the onboarding process.
          </Text>
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
  dateInput: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  noteIcon: {
    marginRight: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
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

export default EditLicenseScreen;
