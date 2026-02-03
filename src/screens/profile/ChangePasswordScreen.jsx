import React, { useState } from 'react';
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
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';

const ChangePasswordScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleChangePassword = async () => {
    if (!formData.currentPassword.trim()) {
      Alert.alert('Error', 'Current password is required');
      return;
    }

    if (!formData.newPassword.trim()) {
      Alert.alert('Error', 'New password is required');
      return;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/users/${user._id}/password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      Alert.alert('Success', 'Password changed successfully', [
        {
          text: 'OK',
          onPress: () => {
            setFormData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
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
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.currentPassword}
              onChangeText={(value) => handleChange('currentPassword', value)}
              placeholder="Enter current password"
              secureTextEntry={!showCurrentPassword}
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons
                name={showCurrentPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.newPassword}
              onChangeText={(value) => handleChange('newPassword', value)}
              placeholder="Enter new password"
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons
                name={showNewPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Must be at least 6 characters</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
              placeholder="Re-enter new password"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons
                name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.changeButton, loading && styles.changeButtonDisabled]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.changeButtonText}>Change Password</Text>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 12,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  changeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  changeButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChangePasswordScreen;
