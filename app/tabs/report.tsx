import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as SQLite from "expo-sqlite";
import { db as firestoreDb } from "../../src/services/firebase";

const localDb =
  Platform.OS === "web" ? null : SQLite.openDatabaseSync("unisafe.db");

export default function ReportScreen() {
  const [hazardType, setHazardType] = useState("");
  const [locationText, setLocationText] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createIncidentReportsTable();
  }, []);

  const createIncidentReportsTable = () => {
    if (!localDb) return;

    try {
      localDb.execSync(`
        CREATE TABLE IF NOT EXISTS incident_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          hazardType TEXT NOT NULL,
          locationText TEXT NOT NULL,
          description TEXT NOT NULL,
          createdAt TEXT NOT NULL
        );
      `);
    } catch (error) {
      console.log("Error creating incident reports table:", error);
    }
  };

  const saveReportToSQLite = () => {
    if (!localDb) {
      console.log("SQLite skipped on web preview.");
      return;
    }

    try {
      localDb.runSync(
        "INSERT INTO incident_reports (hazardType, locationText, description, createdAt) VALUES (?, ?, ?, ?);",
        [
          hazardType.trim(),
          locationText.trim(),
          description.trim(),
          new Date().toISOString(),
        ]
      );
    } catch (error) {
      console.log("Error saving report to SQLite:", error);
    }
  };

  const getCurrentLocationForReport = async () => {
    try {
      if (Platform.OS === "web") {
        setLocationText(
          "GPS location should be tested on Expo Go, Android APK, or Firebase Test Lab."
        );
        Alert.alert(
          "Mobile feature",
          "GPS location is a native mobile feature. Please test it on Expo Go or APK."
        );
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location permission is required to attach GPS location."
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const latitude = currentLocation.coords.latitude.toFixed(6);
      const longitude = currentLocation.coords.longitude.toFixed(6);

      setLocationText(`Latitude: ${latitude}, Longitude: ${longitude}`);
    } catch (error) {
      console.log("Error getting location:", error);
      Alert.alert("Error", "Could not fetch current location.");
    }
  };

  const handleSubmitReport = async () => {
    if (!hazardType.trim() || !locationText.trim() || !description.trim()) {
      Alert.alert("Missing details", "Please complete all hazard report fields.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(firestoreDb, "incident_reports"), {
        hazardType: hazardType.trim(),
        locationText: locationText.trim(),
        description: description.trim(),
        createdAt: serverTimestamp(),
        source: "UniSafe mobile app",
      });

      saveReportToSQLite();

      Alert.alert(
        "Report submitted",
        "Your safety hazard report has been submitted and backed up locally where supported."
      );

      setHazardType("");
      setLocationText("");
      setDescription("");
    } catch (error) {
      console.log("Error submitting report to Firestore:", error);

      saveReportToSQLite();

      Alert.alert(
        "Saved locally",
        "Cloud submission failed, but the report was saved in local SQLite backup where supported."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Report Safety Hazards</Text>
        <Text style={styles.subtitle}>
          Use this form to report unsafe locations or situations around campus.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Hazard Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Hazard type e.g. poor lighting, suspicious activity"
            value={hazardType}
            onChangeText={setHazardType}
            placeholderTextColor="#9CA3AF"
          />

          <TextInput
            style={styles.input}
            placeholder="Location / GPS coordinates"
            value={locationText}
            onChangeText={setLocationText}
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={getCurrentLocationForReport}
          >
            <Text style={styles.secondaryButtonText}>
              Attach Current GPS Location
            </Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Describe the hazard"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmitReport}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Submitting Report..." : "Submit Hazard Report"}
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

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Prototype note</Text>
          <Text style={styles.noteText}>
            Firestore is used for cloud report submission. SQLite backup is
            enabled on mobile/APK builds and skipped in web preview to prevent
            native storage errors.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
    paddingBottom: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 18,
    lineHeight: 22,
  },
  formCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
    color: "#111827",
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#C43D5E",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: "#444444",
    padding: 13,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  infoCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FED7AA",
    marginBottom: 30,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#9A3412",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    color: "#9A3412",
    lineHeight: 20,
  },
});