import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';

const PendingApprovalScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.driver);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await dispatch(logoutUser());
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleReapply = () => {
    navigation.replace('DriverOnboarding');
  };

  const isRejected = profile?.approvalStatus === 'rejected';
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>{isRejected ? '❌' : '⏳'}</Text>
        <Text style={styles.title}>{isRejected ? 'Rejected' : 'Under Review'}</Text>
        <Text style={styles.subtitle}>
          {isRejected
            ? 'Your documents were rejected by admin.'
            : 'Your documents are being reviewed by our admin team.'}
        </Text>
        <Text style={styles.message}>
          {isRejected
            ? 'Please reapply with correct documents.'
            : 'You will receive a notification once your profile is approved or rejected.'}
        </Text>

        <View style={styles.details}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>
            {user?.firstName} {user?.lastName}
          </Text>

          <Text style={[styles.label, { marginTop: 12 }]}>Email:</Text>
          <Text style={styles.value}>{user?.email}</Text>

          <Text style={[styles.label, { marginTop: 12 }]}>Status:</Text>
          <Text style={[styles.value, isRejected ? styles.rejectedStatus : styles.pendingStatus]}>
            {isRejected ? 'Rejected' : 'Pending Approval'}
          </Text>
        </View>

        {isRejected && (
          <TouchableOpacity style={styles.reapplyButton} onPress={handleReapply}>
            <Text style={styles.reapplyButtonText}>Reapply</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  details: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
  },
  pendingStatus: {
    color: '#FF9500',
    fontWeight: 'bold',
  },
  rejectedStatus: {
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  reapplyButton: {
    width: '100%',
    padding: 14,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  reapplyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    width: '100%',
    padding: 14,
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PendingApprovalScreen;
