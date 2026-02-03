import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { logoutUser } from '../../store/slices/authSlice';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.driver);
  const [activeTab, setActiveTab] = useState('personal');
  const [isOnline, setIsOnline] = useState(profile?.isOnline || false);
  const [loading, setLoading] = useState(false);

  const handleToggleAvailability = async () => {
    try {
      setLoading(true);
      // TODO: Call API to update availability
      setIsOnline(!isOnline);
      Alert.alert('Success', `You are now ${!isOnline ? 'online' : 'offline'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logoutUser());
          },
        },
      ]
    );
  };

  const renderPersonalTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>First Name</Text>
          <Text style={styles.value}>{user?.firstName || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Last Name</Text>
          <Text style={styles.value}>{user?.lastName || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{user?.phone || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Vehicle Number</Text>
          <Text style={styles.value}>{profile?.vehicleNumber || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Vehicle Type</Text>
          <Text style={styles.value}>{profile?.vehicleType || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Vehicle Capacity</Text>
          <Text style={styles.value}>{profile?.vehicleCapacity || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Approval Status</Text>
          <View style={[
            styles.statusBadge,
            profile?.approvalStatus === 'approved' && styles.statusApproved,
            profile?.approvalStatus === 'pending' && styles.statusPending,
            profile?.approvalStatus === 'rejected' && styles.statusRejected,
          ]}>
            <Text style={styles.statusText}>
              {profile?.approvalStatus?.toUpperCase() || 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Currently Available</Text>
          <Switch
            value={isOnline}
            onValueChange={handleToggleAvailability}
            disabled={loading || profile?.approvalStatus !== 'approved'}
          />
        </View>
        {profile?.approvalStatus !== 'approved' && (
          <Text style={styles.warningText}>
            You must be approved to go online
          </Text>
        )}
      </View>
    </View>
  );

  const renderLicenseTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>License Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>License Number</Text>
          <Text style={styles.value}>{profile?.licenseNumber || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>License Expiry</Text>
          <Text style={styles.value}>
            {profile?.licenseExpiry 
              ? new Date(profile.licenseExpiry).toLocaleDateString()
              : 'N/A'
            }
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>License Image</Text>
          <Text style={styles.value}>
            {profile?.licenseImageUrl ? 'Uploaded' : 'Not uploaded'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>RC Image</Text>
          <Text style={styles.value}>
            {profile?.rcImageUrl ? 'Uploaded' : 'Not uploaded'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('EditLicense')}
      >
        <MaterialIcons name="edit" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.editButtonText}>Edit License Info</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="person" size={60} color="#fff" />
        </View>
        <Text style={styles.nameText}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
          onPress={() => setActiveTab('personal')}
        >
          <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>
            Personal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'license' && styles.activeTab]}
          onPress={() => setActiveTab('license')}
        >
          <Text style={[styles.tabText, activeTab === 'license' && styles.activeTabText]}>
            License
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {activeTab === 'personal' ? renderPersonalTab() : renderLicenseTab()}

        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <MaterialIcons name="edit" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.passwordButton}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <MaterialIcons name="lock" size={20} color="#007AFF" style={styles.buttonIcon} />
            <Text style={styles.passwordButtonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={20} color="#FF3B30" style={styles.buttonIcon} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 40,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  statusApproved: {
    backgroundColor: '#D4EDDA',
  },
  statusPending: {
    backgroundColor: '#FFF3CD',
  },
  statusRejected: {
    backgroundColor: '#F8D7DA',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  warningText: {
    fontSize: 12,
    color: '#FF3B30',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  buttonSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  editProfileButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  passwordButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
