import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://172.20.10.6:5000/api';

export default function RateConfirmationsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    fetchPendingConfirmations();
  }, []);

  const fetchPendingConfirmations = async () => {
    try {
      if (!loading) setRefreshing(true);
      
      const token = await AsyncStorage.getItem('token');
      
      // Get bookings for this driver where user has signed
      const response = await axios.get(`${API_BASE_URL}/bookings/for-driver`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching confirmations:', error);
      if (loading) {
        Alert.alert('Error', 'Failed to load rate confirmations');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleViewPDF = (pdfUrl) => {
    const fullUrl = `http://172.20.10.6:5000${pdfUrl}`;
    Linking.openURL(fullUrl).catch((err) => {
      Alert.alert('Error', 'Cannot open PDF: ' + err.message);
    });
  };

  const handleAccept = async (bookingId) => {
    Alert.alert(
      'Accept Rate Confirmation',
      'Do you want to accept this rate confirmation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              setAccepting(bookingId);
              const token = await AsyncStorage.getItem('token');
              
              await axios.post(
                `${API_BASE_URL}/bookings/${bookingId}/rate-confirmation/driver-accept`,
                { signatureUrl: null }, // Optional signature
                { headers: { Authorization: `Bearer ${token}` } }
              );

              Alert.alert('Success', 'Rate confirmation accepted! Booking is now ready for pickup.');
              fetchPendingConfirmations();
            } catch (error) {
              console.error('Error accepting:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to accept rate confirmation'
              );
            } finally {
              setAccepting(null);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.bookingId}>ID: {item._id.slice(-8)}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>USER SIGNED</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <Text style={styles.locationLabel}>Pickup:</Text>
        <Text style={styles.locationText} numberOfLines={1}>
          {item.pickupLocation?.address || 'N/A'}
        </Text>
        <Text style={styles.locationLabel}>Delivery:</Text>
        <Text style={styles.locationText} numberOfLines={1}>
          {item.deliveryLocation?.address || 'N/A'}
        </Text>
      </View>

      <View style={styles.quoteInfo}>
        <Text style={styles.amountLabel}>Rate:</Text>
        <Text style={styles.amount}>₹ {item.selectedQuote?.amount || 0}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.viewButton]}
          onPress={() => handleViewPDF(item.rateConfirmation.pdfUrl)}
        >
          <Text style={styles.buttonText}>📄 View PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.acceptButton, accepting === item._id && styles.buttonDisabled]}
          onPress={() => handleAccept(item._id)}
          disabled={accepting === item._id}
        >
          {accepting === item._id ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[styles.buttonText, styles.acceptButtonText]}>✓ Accept</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rate Confirmations</Text>
        <Text style={styles.headerSubtitle}>
          {bookings.length} pending acceptance
        </Text>
      </View>

      {bookings.length > 0 ? (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchPendingConfirmations} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending confirmations</Text>
          <Text style={styles.emptySubText}>
            Rate confirmations waiting for your acceptance will appear here
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookingId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1976D2',
  },
  routeContainer: {
    marginBottom: 10,
  },
  locationLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
  },
  quoteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#ff9800',
  },
  acceptButton: {
    backgroundColor: '#4caf50',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButtonText: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 13,
    color: '#ccc',
    textAlign: 'center',
  },
});
