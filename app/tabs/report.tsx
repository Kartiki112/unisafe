import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as SQLite from 'expo-sqlite';
import { db } from '../../src/services/firebase';

const localDb = SQLite.openDatabaseSync('unisafe.db');

export default function ReportScreen() {
  const [hazardType, setHazardType] = useState('');
  const [locationText, setLocationText] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createIncidentReportsTable();
  }, []);

  const createIncidentReportsTable = () => {
    try {
      localDb.execSync(`
        CREATE TABLE IF NOT EXISTS incident_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          hazardType TEXT NOT NULL,
          location TEXT NOT NULL,
          description TEXT NOT NULL,
          createdAt TEXT NOT NULL
        );
      `);
    } catch (error) {
      console.log('Error creating incident_reports table:', error);
    }
  };

  const saveReportToSQLite = () => {
    try {
      localDb.runSync(
        'INSERT INTO incident_reports (hazardType, location, description, createdAt) VALUES (?, ?, ?, ?);',
        [
          hazardType.trim(),
          locationText.trim(),
          description.trim(),
          new Date().toISOString(),
        ]
      );
    } catch (error) {
      console.log('Error saving report to SQLite:', error);
    }
  };

  const getCurrentLocationForReport = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to attach GPS location.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const latitude = currentLocation.coords.latitude.toFixed(6);
      const longitude = currentLocation.coords.longitude.toFixed(6);

      setLocationText(`Latitude: ${latitude}, Longitude: ${longitude}`);
    } catch (error) {
      console.log('Error getting location:', error);
      Alert.alert('Error', 'Could not fetch current location.');
    }
  };

  const handleSubmitReport = async () => {
    if (!hazardType.trim() || !locationText.trim() || !description.trim()) {
      Alert.alert('Missing details', 'Please complete all hazard report fields.');
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, 'incident_reports'), {
        hazardType: hazardType.trim(),
        location: locationText.trim(),
        description: description.trim(),
        createdAt: serverTimestamp(),
        source: 'UniSafe mobile app',
      });

      saveReportToSQLite();

      Alert.alert(
        'Report submitted',
        'Your safety hazard report has been submitted and backed up locally.'
      );

      setHazardType('');
      setLocationText('');
      setDescription('');
      setLoading(false);
    } catch (error) {
      console.log('Error submitting report to Firestore:', error);

      saveReportToSQLite();

      setLoading(false);
      Alert.alert(
        'Saved locally',
        'Cloud submission failed, but the report was saved in local SQLite backup.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Report Safety Hazards</Text>
        <Text style={styles.subtitle}>
          Use this form to report unsafe locations or situations around campus.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Hazard Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Hazard type (e.g. poor lighting, suspicious activity)"
            value={hazardType}
            onChangeText={setHazardType}
          />

          <TextInput
            style={styles.input}
            placeholder="Location / GPS coordinates"
            value={locationText}
            onChangeText={setLocationText}
          />

          <TouchableOpacity style={styles.secondaryButton} onPress={getCurrentLocationForReport}>
            <Text style={styles.secondaryButtonText}>Attach Current GPS Location</Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Describe the hazard"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReport}>
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting Report...' : 'Submit Hazard Report'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Examples of hazards</Text>
          <Text style={styles.infoText}>• Broken lights in walkways</Text>
          <Text style={styles.infoText}>• Unsafe or isolated campus areas</Text>
          <Text style={styles.infoText}>• Suspicious behaviour nearby</Text>
          <Text style={styles.infoText}>• Damaged paths or blocked exits</Text>
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
    paddingBottom: 120,
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
  formCard: {
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
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#c53d5c',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  infoCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#fff',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
});