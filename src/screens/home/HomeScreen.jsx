import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoads } from '../../store/slices/loadSlice';
import { logoutUser } from '../../store/slices/authSlice';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loads, loading } = useSelector((state) => state.loads);
  const { user } = useSelector((state) => state.auth);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    dispatch(fetchLoads());
  }, [dispatch]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        { text: 'Logout', onPress: async () => { await dispatch(logoutUser()); }, style: 'destructive' }
      ]
    );
  };

  const currentTrip = loads?.[0];

  const getStatusColor = (status) => {
    const colors = {
      assigned: '#4169E1',
      accepted: '#1E90FF',
      going_to_pickup: '#6A5ACD',
      arrived_at_pickup: '#008B8B',
      loading: '#FF8C00',
      loaded: '#20B2AA',
      in_transit: '#32CD32',
      arrived_at_drop: '#8A2BE2',
      delivered: '#228B22',
      completed: '#2E8B57',
      rejected: '#DC143C'
    };
    return colors[status] || '#808080';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcome}>Welcome, {user?.firstName || 'Driver'}</Text>
            <Text style={styles.subtitle}>Stay online to receive trips</Text>
          </View>
          <TouchableOpacity
            style={[styles.statusPill, { backgroundColor: isOnline ? '#1E88E5' : '#cbd5e1' }]}
            onPress={() => setIsOnline(!isOnline)}
          >
            <View style={[styles.dot, { backgroundColor: isOnline ? '#34d399' : '#94a3b8' }]} />
            <Text style={[styles.statusText, { color: isOnline ? '#fff' : '#475569' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('ProfileTab')}>
            <Text style={styles.secondaryBtnText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleLogout}>
            <Text style={styles.secondaryBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Trip</Text>
        {loading ? (
          <ActivityIndicator color="#1976D2" style={{ marginTop: 20 }} />
        ) : currentTrip ? (
          <TouchableOpacity
            style={styles.tripCard}
            onPress={() => navigation.navigate('TripTracking', { tripId: currentTrip.tripId })}
          >
            <View style={styles.tripHeader}>
              <Text style={styles.tripLabel}>
                {currentTrip.tripId ? `Trip ${currentTrip.tripId.slice(-6)}` : 'Assigned Trip'}
              </Text>
              <View style={[styles.badge, { backgroundColor: getStatusColor(currentTrip.status) }]}>
                <Text style={styles.badgeText}>{currentTrip.status?.replace(/_/g, ' ')}</Text>
              </View>
            </View>
            <Text style={styles.route}>{currentTrip.pickup || 'Pickup TBD'} → {currentTrip.drop || 'Drop TBD'}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>Truck: {currentTrip.truckType || 'N/A'}</Text>
              <Text style={styles.meta}>Weight: {currentTrip.weight ? `${currentTrip.weight} kg` : 'N/A'}</Text>
            </View>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('TripTracking', { tripId: currentTrip.tripId })}
            >
              <Text style={styles.primaryBtnText}>Start Trip / Update Status</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ) : (
          <Text style={styles.empty}>No assigned trip yet. Stay online to receive trips.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('TripsTab')}>
            <Text style={styles.quickIcon}>🚚</Text>
            <Text style={styles.quickText}>View Trips</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('AssignedTrips')}>
            <Text style={styles.quickIcon}>📋</Text>
            <Text style={styles.quickText}>Assigned</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('RateConfirmations')}>
            <Text style={styles.quickIcon}>📄</Text>
            <Text style={styles.quickText}>Confirmations</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    backgroundColor: '#1976D2',
    paddingTop: 52,
    paddingBottom: 22,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcome: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: { color: 'rgba(255,255,255,0.85)', marginTop: 6, fontSize: 14 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 8
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontWeight: '700', fontSize: 13 },
  headerButtons: { flexDirection: 'row', gap: 10 },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  secondaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  section: { paddingHorizontal: 16, paddingTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 10 },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tripLabel: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12, textTransform: 'capitalize' },
  route: { fontSize: 15, color: '#1f2937', marginBottom: 8, fontWeight: '600' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  meta: { fontSize: 13, color: '#475569' },
  primaryBtn: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  empty: { color: '#94a3b8', fontSize: 14, marginTop: 8 },
  quickRow: { flexDirection: 'row', gap: 12 },
  quickBtn: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1
  },
  quickIcon: { fontSize: 18, marginBottom: 6 },
  quickText: { fontWeight: '700', color: '#0f172a' }
});

export default HomeScreen;
