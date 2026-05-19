import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import * as SQLite from 'expo-sqlite';
import { useLocalSearchParams } from 'expo-router';

type RouteItem = {
  id: number;
  destination: string;
  routePreview: string;
};

const db = SQLite.openDatabaseSync('unisafe.db');

export default function RouteScreen() {
  const { destination: routeDestination } = useLocalSearchParams<{ destination?: string }>();

  const [locationText, setLocationText] = useState('No location fetched yet.');
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [region, setRegion] = useState<Region>({
    latitude: -33.8688,
    longitude: 151.2093,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [markerCoords, setMarkerCoords] = useState({
    latitude: -33.8688,
    longitude: 151.2093,
  });

  const [destination, setDestination] = useState('');
  const [routePreview, setRoutePreview] = useState('No route planned yet.');
  const [routeHistory, setRouteHistory] = useState<RouteItem[]>([]);

  useEffect(() => {
    createRouteTable();
    loadRouteHistory();
  }, []);

  useEffect(() => {
    if (routeDestination && typeof routeDestination === 'string') {
      setDestination(routeDestination);
    }
  }, [routeDestination]);

  const createRouteTable = () => {
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS route_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          destination TEXT NOT NULL,
          routePreview TEXT NOT NULL
        );
      `);
    } catch (error) {
      console.log('Error creating route history table:', error);
    }
  };

  const loadRouteHistory = () => {
    try {
      const result = db.getAllSync(
        'SELECT * FROM route_history ORDER BY id DESC;'
      ) as RouteItem[];
      setRouteHistory(result);
    } catch (error) {
      console.log('Error loading route history:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature.');
        setLocationText('Location permission was denied.');
        setLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const latitude = currentLocation.coords.latitude;
      const longitude = currentLocation.coords.longitude;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      setMarkerCoords({
        latitude,
        longitude,
      });

      setLocationText(`Latitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`);
      setLoadingLocation(false);
    } catch (error) {
      setLoadingLocation(false);
      Alert.alert('Error', 'Unable to fetch location.');
      setLocationText('Failed to fetch location.');
    }
  };

  const handlePlanRoute = () => {
    if (!destination.trim()) {
      Alert.alert('Missing destination', 'Please enter a destination first.');
      return;
    }

    const preview = `Suggested safe walking route to ${destination.trim()}: stay on well-lit paths, avoid isolated shortcuts, and keep check-in reminders enabled.`;

    setRoutePreview(preview);

    try {
      db.runSync(
        'INSERT INTO route_history (destination, routePreview) VALUES (?, ?);',
        [destination.trim(), preview]
      );
      loadRouteHistory();
      Alert.alert('Route planned', 'Safe walking route preview created.');
    } catch (error) {
      console.log('Error saving route history:', error);
      Alert.alert('Saved in preview only', 'Route preview created, but history could not be saved.');
    }

    setDestination('');
  };

  const handleClearHistory = () => {
    try {
      db.runSync('DELETE FROM route_history;');
      loadRouteHistory();
      Alert.alert('Cleared', 'Route history has been cleared.');
    } catch (error) {
      console.log('Error clearing route history:', error);
      Alert.alert('Error', 'Could not clear route history.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Safe Route / GPS</Text>
        <Text style={styles.subtitle}>
          Check your current location and plan a safer walking route.
        </Text>

        <MapView style={styles.map} region={region}>
          <Marker coordinate={markerCoords} title="Current Location" />
        </MapView>

        <Text style={styles.locationText}>{locationText}</Text>

        <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
          <Text style={styles.locationButtonText}>
            {loadingLocation ? 'Fetching Location...' : 'Get Current Location'}
          </Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Plan Safe Route</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter destination"
            value={destination}
            onChangeText={setDestination}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handlePlanRoute}>
            <Text style={styles.primaryButtonText}>Plan Safe Route</Text>
          </TouchableOpacity>

          <Text style={styles.previewLabel}>Route Preview</Text>
          <Text style={styles.previewText}>{routePreview}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Route History</Text>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={routeHistory}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No saved routes yet.</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.historyCard}>
                <Text style={styles.historyDestination}>{item.destination}</Text>
                <Text style={styles.historyPreview}>{item.routePreview}</Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 18,
  },
  map: {
    width: '100%',
    height: 320,
    borderRadius: 14,
    marginBottom: 14,
  },
  locationText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 14,
  },
  locationButton: {
    backgroundColor: '#c53d5c',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: '#c53d5c',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
  },
  historyCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  historyDestination: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
  },
  historyPreview: {
    color: '#555',
    lineHeight: 20,
  },
});