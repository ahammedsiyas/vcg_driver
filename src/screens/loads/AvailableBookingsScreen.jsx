import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import bookingService from '../../services/booking.service';

export default function AvailableBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);

  useEffect(() => {
    loadAvailableBookings();
  }, []);

  const loadAvailableBookings = async () => {
    try {
      setLoading(true);
      const available = await bookingService.getAvailableBookings();
      console.log('[AvailableBookings] Loaded:', available?.length || 0, 'bookings');
      setBookings(Array.isArray(available) ? available : []);
    } catch (error) {
      console.log('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load available bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuoteModal = (booking) => {
    setSelectedBooking(booking);
    setQuoteAmount('');
    setQuoteNotes('');
  };

  const handleSubmitQuote = async () => {
    if (!quoteAmount || parseFloat(quoteAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid quote amount');
      return;
    }

    setSubmittingQuote(true);
    try {
      console.log('[submitQuote] Submitting quote:', {
        bookingId: selectedBooking._id,
        amount: parseFloat(quoteAmount),
        notes: quoteNotes
      });
      await bookingService.submitQuote(selectedBooking._id, {
        amount: parseFloat(quoteAmount),
        notes: quoteNotes,
      });
      console.log('[submitQuote] Quote submitted successfully!');
      Alert.alert('Success', 'Quote submitted successfully!');
      setSelectedBooking(null);
      loadAvailableBookings(); // Refresh list
    } catch (error) {
      console.log('Error submitting quote:', error?.response?.data || error.message);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to submit quote');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const renderBookingCard = ({ item: booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.bookingId}>Booking #{booking._id.slice(-6)}</Text>
        <Text style={[styles.status, { color: booking.status === 'pending' ? '#ff9800' : '#4caf50' }]}>
          {booking.status.toUpperCase()}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Pickup:</Text>
          <Text style={styles.value}>{booking.pickupLocation?.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Delivery:</Text>
          <Text style={styles.value}>{booking.deliveryLocation?.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Truck Type:</Text>
          <Text style={styles.value}>{booking.truckType}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Load Weight:</Text>
          <Text style={styles.value}>{booking.loadDetails?.weight} kg</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Pickup Date:</Text>
          <Text style={styles.value}>
            {booking.pickupDate ? new Date(booking.pickupDate).toDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.quoteButton}
        onPress={() => handleOpenQuoteModal(booking)}
      >
        <Text style={styles.quoteButtonText}>Send Quote</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7b2ff2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Bookings</Text>
        <Text style={styles.headerSubtitle}>Submit quotes to win loads</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No bookings available</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={!!selectedBooking}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Quote</Text>
              <TouchableOpacity onPress={() => setSelectedBooking(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedBooking && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.bookingSummary}>
                  <Text style={styles.summaryTitle}>Booking Details</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>From:</Text>
                    <Text style={styles.summaryValue}>{selectedBooking.pickupLocation?.address}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>To:</Text>
                    <Text style={styles.summaryValue}>{selectedBooking.deliveryLocation?.address}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Weight:</Text>
                    <Text style={styles.summaryValue}>{selectedBooking.loadDetails?.weight} kg</Text>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Quote Amount (₹) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your quote amount"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={quoteAmount}
                    onChangeText={setQuoteAmount}
                    editable={!submittingQuote}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Notes (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add any notes about this quote"
                    placeholderTextColor="#999"
                    value={quoteNotes}
                    onChangeText={setQuoteNotes}
                    multiline
                    numberOfLines={4}
                    editable={!submittingQuote}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, submittingQuote && styles.submitButtonDisabled]}
                  onPress={handleSubmitQuote}
                  disabled={submittingQuote}
                >
                  {submittingQuote ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Quote</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setSelectedBooking(null)}
                  disabled={submittingQuote}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#7b2ff2',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 5,
  },
  listContent: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bookingId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  infoRow: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  quotesInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  quotesCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  quoteButton: {
    backgroundColor: '#7b2ff2',
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  quoteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  modalBody: {
    padding: 20,
  },
  bookingSummary: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  summaryRow: {
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  summaryValue: {
    fontSize: 13,
    color: '#333',
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#7b2ff2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
