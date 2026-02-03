import React, { useEffect } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoads } from '../../store/slices/loadSlice';

const TripsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loads, loading } = useSelector((state) => state.loads);

  useEffect(() => {
    dispatch(fetchLoads());
  }, [dispatch]);

  const assigned = loads.filter((t) => !['delivered', 'completed'].includes(t.status));
  const past = loads.filter((t) => ['delivered', 'completed'].includes(t.status));

  const sections = [
    { title: 'Assigned Trips', data: assigned },
    { title: 'Past Trips', data: past }
  ];

  const renderStatus = (status) => {
    const colors = {
      assigned: '#1976D2',
      accepted: '#0D47A1',
      going_to_pickup: '#1565C0',
      arrived_at_pickup: '#00897B',
      loading: '#FB8C00',
      loaded: '#43A047',
      in_transit: '#2E7D32',
      arrived_at_drop: '#6A1B9A',
      delivered: '#388E3C',
      completed: '#2E7D32',
      rejected: '#D32F2F'
    };
    const label = status?.replace(/_/g, ' ') || 'unknown';
    return (
      <View style={[styles.badge, { backgroundColor: colors[status] || '#78909C' }]}> 
        <Text style={styles.badgeText}>{label}</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TripTracking', { tripId: item.tripId })}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.tripId ? `Trip ${item.tripId.slice(-6)}` : 'Trip'}</Text>
        {renderStatus(item.status)}
      </View>
      <Text style={styles.route}>{item.pickup || 'Pickup TBD'} → {item.drop || 'Drop TBD'}</Text>
      <View style={styles.row}>
        <Text style={styles.meta}>Truck: {item.truckType || 'N/A'}</Text>
        <Text style={styles.meta}>Weight: {item.weight ? `${item.weight} kg` : 'N/A'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}> 
        <Text style={styles.headerTitle}>Trips</Text>
        <Text style={styles.headerSubtitle}>Assigned and past trips</Text>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.tripId || item._id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length}</Text>
          </View>
        )}
        ListEmptyComponent={!loading && (
          <Text style={styles.empty}>No trips to show</Text>
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshing={loading}
        onRefresh={() => dispatch(fetchLoads())}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  header: { backgroundColor: '#1976D2', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', marginTop: 6, fontSize: 14 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 16,
    marginBottom: 8
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0D47A1' },
  sectionCount: { fontSize: 13, color: '#1976D2', fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  route: { fontSize: 14, color: '#334155', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontSize: 13, color: '#475569' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12, textTransform: 'capitalize' },
  empty: { textAlign: 'center', marginTop: 32, color: '#94a3b8', fontSize: 14 }
});

export default TripsScreen;
