import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  ScrollView 
} from 'react-native';
import { useSelector } from 'react-redux';
import api from '../../services/api';

const TripTrackingScreen = ({ route, navigation }) => {
  const { tripId } = route.params;
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { token } = useSelector((state) => state.auth);

  // Status flow order
  const statusFlow = [
    { key: 'accepted', label: 'Trip Accepted', completed: false },
    { key: 'going_to_pickup', label: 'Go to Pickup', button: 'Going to Pickup' },
    { key: 'arrived_at_pickup', label: 'Arrived at Pickup', button: 'Arrived at Pickup' },
    { key: 'loading', label: 'Loading', button: 'Start Loading' },
    { key: 'loaded', label: 'Loaded', button: 'Confirm Loaded' },
    { key: 'in_transit', label: 'In Transit', button: 'Start Trip' },
    { key: 'arrived_at_drop', label: 'Arrived at Drop', button: 'Arrived at Drop' },
    { key: 'delivered', label: 'Delivered', button: 'Mark Delivered' },
  ];

  useEffect(() => {
    fetchTripDetails();
  }, []);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/trips/${tripId}/track`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrip(response.data);
    } catch (error) {
      console.error('Fetch trip details error:', error);
      Alert.alert('Error', 'Failed to fetch trip details');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    Alert.alert(
      'Update Status',
      `Confirm: ${statusFlow.find(s => s.key === newStatus)?.label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setUpdating(true);
              await api.put(`/trips/${tripId}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` }}
              );
              
              // Refresh trip data
              await fetchTripDetails();
              
              Alert.alert('Success', 'Status updated successfully!');
              
              // If delivered, navigate back
              if (newStatus === 'delivered') {
                setTimeout(() => {
                  navigation.goBack();
                }, 1500);
              }
            } catch (error) {
              console.error('Update status error:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const getCurrentStatusIndex = () => {
    if (!trip) return -1;
    return statusFlow.findIndex(s => s.key === trip.status);
  };

  const getNextStatus = () => {
    const currentIndex = getCurrentStatusIndex();
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7b2ff2" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Trip not found</Text>
      </View>
    );
  }

  const nextStatus = getNextStatus();
  const currentIndex = getCurrentStatusIndex();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trip Tracking</Text>
        <View style={styles.currentStatusBadge}>
          <Text style={styles.currentStatusText}>
            {statusFlow.find(s => s.key === trip.status)?.label || trip.status}
          </Text>
        </View>
      </View>

      {/* Trip Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trip Details</Text>
        
        <View style={styles.routeContainer}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Pickup Location</Text>
              <Text style={styles.locationText}>{trip.booking?.pickup}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📌</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Drop Location</Text>
              <Text style={styles.locationText}>{trip.booking?.drop}</Text>
            </View>
          </View>
        </View>

        {trip.driver && (
          <View style={styles.driverInfo}>
            <Text style={styles.infoLabel}>Driver: {trip.driver.name}</Text>
            <Text style={styles.infoLabel}>Phone: {trip.driver.phone}</Text>
          </View>
        )}
      </View>

      {/* Status Timeline */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trip Progress</Text>
        
        <View style={styles.timeline}>
          {statusFlow.map((status, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <View key={status.key} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                    isCompleted && styles.timelineDotCompleted,
                    isCurrent && styles.timelineDotCurrent
                  ]}>
                    {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  {index < statusFlow.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      isCompleted && styles.timelineLineCompleted
                    ]} />
                  )}
                </View>
                
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineLabel,
                    isCompleted && styles.timelineLabelCompleted,
                    isCurrent && styles.timelineLabelCurrent
                  ]}>
                    {status.label}
                  </Text>
                  {isCurrent && <Text style={styles.currentIndicator}>Current</Text>}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Action Button */}
      {nextStatus && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, updating && styles.actionButtonDisabled]}
            onPress={() => updateStatus(nextStatus.key)}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>{nextStatus.button}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {trip.status === 'delivered' && (
        <View style={styles.completedContainer}>
          <Text style={styles.completedIcon}>✅</Text>
          <Text style={styles.completedText}>Trip Completed!</Text>
        </View>
      )}
    </ScrollView>
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
  header: {
    backgroundColor: '#7b2ff2',
    padding: 24,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 14,
  },
  currentStatusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentStatusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 20,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 18,
  },
  routeContainer: {
    marginBottom: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationIcon: {
    fontSize: 28,
    marginRight: 14,
    marginTop: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
    fontWeight: '500',
  },
  locationText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  driverInfo: {
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  timeline: {
    paddingVertical: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 18,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: '#7b2ff2',
    borderColor: '#7b2ff2',
  },
  timelineDotCurrent: {
    borderColor: '#7b2ff2',
    borderWidth: 3,
    backgroundColor: '#f8f9fa',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  timelineLine: {
    width: 2.5,
    flex: 1,
    backgroundColor: '#ddd',
    marginVertical: 6,
  },
  timelineLineCompleted: {
    backgroundColor: '#7b2ff2',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineLabel: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  timelineLabelCompleted: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  timelineLabelCurrent: {
    color: '#7b2ff2',
    fontWeight: '700',
  },
  currentIndicator: {
    fontSize: 12,
    color: '#7b2ff2',
    marginTop: 4,
    fontWeight: '600',
  },
  actionContainer: {
    padding: 18,
    paddingBottom: 28,
  },
  actionButton: {
    backgroundColor: '#7b2ff2',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  completedContainer: {
    alignItems: 'center',
    padding: 40,
    paddingTop: 60,
  },
  completedIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  completedText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#32CD32',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});

export default TripTrackingScreen;
