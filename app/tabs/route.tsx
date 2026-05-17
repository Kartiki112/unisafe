import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';

export default function RouteScreen() {
  const [locationText, setLocationText] = useState('No location fetched yet.');
  const [loading, setLoading] = useState(false);
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

  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature.');
        setLocationText('Location permission was denied.');
        setLoading(false);
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

      setLocationText(
        `Latitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Unable to fetch location.');
      setLocationText('Failed to fetch location.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safe Route / GPS</Text>
      <Text style={styles.subtitle}>
        This screen helps the user check their current location for safe travel support.
      </Text>

      <MapView style={styles.map} region={region}>
        <Marker coordinate={markerCoords} title="Current Location" />
      </MapView>

      <Text style={styles.locationText}>{locationText}</Text>

      <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
        <Text style={styles.buttonText}>
          {loading ? 'Fetching Location...' : 'Get Current Location'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: 420,
    borderRadius: 14,
    marginBottom: 16,
  },
  locationText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#c53d5c',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});