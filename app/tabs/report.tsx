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
        "Your safety hazard report has been submitted successfully."
      );

      setHazardType("");
      setLocationText("");
      setDescription("");
    } catch (error) {
      console.log("Error submitting report to Firestore:", error);

      saveReportToSQLite();

      Alert.alert(
        "Saved locally",
        "Cloud submission failed, but the report was saved locally where supported."
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
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Safety reporting</Text>
          <Text style={styles.title}>Report Hazard</Text>
          <Text style={styles.subtitle}>
            Report unsafe locations, suspicious activity, poor lighting, or
            campus hazards.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Hazard Details</Text>
          <Text style={styles.sectionText}>
            Provide clear details so the safety issue can be reviewed.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Hazard type e.g. poor lighting"
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
              {loading ? "Submitting..." : "Submit Hazard Report"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Examples of hazards</Text>

          <View style={styles.exampleRow}>
            <Text style={styles.tick}>✓</Text>
            <Text style={styles.infoText}>Poor lighting on walkways</Text>
          </View>

          <View style={styles.exampleRow}>
            <Text style={styles.tick}>✓</Text>
            <Text style={styles.infoText}>Suspicious activity nearby</Text>
          </View>

          <View style={styles.exampleRow}>
            <Text style={styles.tick}>✓</Text>
            <Text style={styles.infoText}>Damaged paths or blocked exits</Text>
          </View>

          <View style={styles.exampleRow}>
            <Text style={styles.tick}>✓</Text>
            <Text style={styles.infoText}>Unsafe or isolated campus areas</Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Storage note</Text>
          <Text style={styles.noteText}>
            Reports are submitted to Firestore. SQLite backup works on mobile/APK
            builds and is safely skipped in web preview to avoid native storage
            errors.
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
    paddingBottom: 160,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#F1B4C1",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#EF3B45",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 15,
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
    backgroundColor: "#EF3B45",
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
    backgroundColor: "#111827",
    padding: 13,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  exampleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tick: {
    color: "#16A34A",
    fontWeight: "900",
    fontSize: 18,
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    flex: 1,
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