import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  Alert 
} from 'react-native';
import { useSelector } from 'react-redux';
import api from '../../services/api';

const AssignedTripsScreen = ({ navigation }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchAssignedTrips();
  }, []);

  const fetchAssignedTrips = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trips/driver/assigned', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(response.data);
    } catch (error) {
      console.error('Fetch assigned trips error:', error.message);
      console.error('Error code:', error.code);
      console.error('Error config:', error.config?.url);
      
      // Show specific error message based on error type
      let errorMsg = 'Failed to fetch assigned trips';
      if (error.code === 'ECONNREFUSED') {
        errorMsg = 'Cannot connect to server. Make sure the backend is running on port 5000';
      } else if (error.code === 'ERR_NETWORK') {
        errorMsg = 'Network error. Check your connection and server URL';
      } else if (error.response?.status === 401) {
        errorMsg = 'Session expired. Please login again';
      } else if (error.message === 'Network Error') {
        errorMsg = 'Network error. Verify server is running at the correct address';
      }
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignedTrips();
  };

  const handleAccept = async (tripId) => {
    Alert.alert(
      'Accept Trip',
      'Are you sure you want to accept this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await api.post(`/trips/${tripId}/accept`, {}, {
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert('Success', 'Trip accepted successfully!');
              // Navigate to trip tracking screen
              navigation.navigate('TripTracking', { tripId });
            } catch (error) {
              console.error('Accept trip error:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to accept trip');
            }
          }
        }
      ]
    );
  };

  const handleReject = async (tripId) => {
    Alert.alert(
      'Reject Trip',
      'Are you sure you want to reject this trip? Admin will be notified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/trips/${tripId}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert('Success', 'Trip rejected');
              fetchAssignedTrips(); // Refresh list
            } catch (error) {
              console.error('Reject trip error:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to reject trip');
            }
          }
        }
      ]
    );
  };

  const renderTrip = ({ item }) => (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripId}>Trip #{item.tripId.slice(-6)}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Pickup</Text>
            <Text style={styles.locationText}>{item.pickup}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📌</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Drop</Text>
            <Text style={styles.locationText}>{item.drop}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Truck Type:</Text>
          <Text style={styles.detailValue}>{item.truckType}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Weight:</Text>
          <Text style={styles.detailValue}>{item.weight} kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pickup Date:</Text>
          <Text style={styles.detailValue}>
            {new Date(item.pickupDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Customer:</Text>
          <Text style={styles.detailValue}>{item.customerName}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.rejectButton]} 
          onPress={() => handleReject(item.tripId)}
        >
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.acceptButton]} 
          onPress={() => handleAccept(item.tripId)}
        >
          <Text style={styles.acceptButtonText}>Accept Trip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7b2ff2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={(item) => item.tripId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚚</Text>
            <Text style={styles.emptyText}>No assigned trips</Text>
            <Text style={styles.emptySubtext}>
              Trips assigned by admin will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statusBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  routeContainer: {
    marginBottom: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  locationIcon: {
    fontSize: 22,
    marginRight: 12,
    marginTop: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    fontWeight: '500',
  },
  locationText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#7b2ff2',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  rejectButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  rejectButtonText: {
    color: '#DC143C',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default AssignedTripsScreen;
