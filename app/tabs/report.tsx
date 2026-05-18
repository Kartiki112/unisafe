import React, { useState } from 'react';
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

export default function ReportScreen() {
  const [hazardType, setHazardType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmitReport = () => {
    if (!hazardType.trim() || !location.trim() || !description.trim()) {
      Alert.alert('Missing details', 'Please complete all hazard report fields.');
      return;
    }

    Alert.alert(
      'Report submitted',
      'Your safety hazard report has been recorded successfully.'
    );

    setHazardType('');
    setLocation('');
    setDescription('');
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
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
          />

          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Describe the hazard"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReport}>
            <Text style={styles.submitButtonText}>Submit Hazard Report</Text>
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