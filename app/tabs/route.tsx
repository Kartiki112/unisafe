import React, { useEffect, useState } from "react";
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
  Linking,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import * as SQLite from "expo-sqlite";
import { useLocalSearchParams } from "expo-router";

let MapView: any = null;
let Marker: any = null;
let Circle: any = null;

if (Platform.OS !== "web") {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
  Circle = Maps.Circle;
}

type RouteItem = {
  id: number;
  destination: string;
  routePreview: string;
};

type CoordinateType = {
  latitude: number;
  longitude: number;
};

const localDb =
  Platform.OS === "web" ? null : SQLite.openDatabaseSync("unisafe.db");

export default function RouteScreen() {
  const { destination: routeDestination } =
    useLocalSearchParams<{ destination?: string }>();

  const [locationText, setLocationText] = useState("No location fetched yet.");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [destination, setDestination] = useState("");
  const [routePreview, setRoutePreview] = useState("No route planned yet.");
  const [routeHistory, setRouteHistory] = useState<RouteItem[]>([]);
  const [currentCoords, setCurrentCoords] = useState<CoordinateType | null>(
    null
  );

  useEffect(() => {
    createRouteTable();
    loadRouteHistory();
  }, []);

  useEffect(() => {
    if (routeDestination && typeof routeDestination === "string") {
      setDestination(routeDestination);
    }
  }, [routeDestination]);

  const createRouteTable = () => {
    if (!localDb) return;

    try {
      localDb.execSync(`
        CREATE TABLE IF NOT EXISTS route_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          destination TEXT NOT NULL,
          routePreview TEXT NOT NULL
        );
      `);
    } catch (error) {
      console.log("Error creating route history table:", error);
    }
  };

  const loadRouteHistory = () => {
    if (!localDb) return;

    try {
      const result = localDb.getAllSync(
        "SELECT * FROM route_history ORDER BY id DESC;"
      ) as RouteItem[];

      setRouteHistory(result);
    } catch (error) {
      console.log("Error loading route history:", error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);

      if (Platform.OS === "web") {
        setLocationText(
          "GPS is a mobile-device feature. Test using Expo Go, Android APK, or Firebase Test Lab."
        );
        setLoadingLocation(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location permission is required to use this feature."
        );
        setLocationText("Location permission was denied.");
        setLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      setCurrentCoords({ latitude, longitude });

      setLocationText(
        `Latitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`
      );

      setLoadingLocation(false);
    } catch (error) {
      console.log("Location error:", error);
      setLoadingLocation(false);
      Alert.alert("Error", "Unable to fetch location.");
      setLocationText("Failed to fetch location.");
    }
  };

  const handlePlanRoute = () => {
    if (!destination.trim()) {
      Alert.alert("Missing destination", "Please enter a destination first.");
      return;
    }

    const preview = `Suggested safe walking route to ${destination.trim()}: stay on well-lit paths, avoid isolated shortcuts, and keep check-in reminders enabled.`;

    setRoutePreview(preview);

    if (!localDb) {
      Alert.alert(
        "Route planned",
        "Safe walking route preview created. SQLite route history is available on mobile/APK."
      );
      setDestination("");
      return;
    }

    try {
      localDb.runSync(
        "INSERT INTO route_history (destination, routePreview) VALUES (?, ?);",
        [destination.trim(), preview]
      );

      loadRouteHistory();
      Alert.alert("Route planned", "Safe walking route preview created.");
    } catch (error) {
      console.log("Error saving route history:", error);
      Alert.alert(
        "Saved in preview only",
        "Route preview created, but history could not be saved."
      );
    }

    setDestination("");
  };

  const handleOpenGoogleMaps = async () => {
    if (!destination.trim()) {
      Alert.alert("Missing destination", "Please enter a destination first.");
      return;
    }

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      destination.trim()
    )}&travelmode=walking`;

    try {
      const supported = await Linking.canOpenURL(googleMapsUrl);

      if (supported) {
        await Linking.openURL(googleMapsUrl);
      } else {
        Alert.alert("Error", "Could not open Google Maps.");
      }
    } catch (error) {
      console.log("Error opening Google Maps:", error);
      Alert.alert("Error", "Could not open Google Maps.");
    }
  };

  const handleClearHistory = () => {
    if (!localDb) {
      setRouteHistory([]);
      Alert.alert("Cleared", "Preview route history has been cleared.");
      return;
    }

    try {
      localDb.runSync("DELETE FROM route_history;");
      loadRouteHistory();
      Alert.alert("Cleared", "Route history has been cleared.");
    } catch (error) {
      console.log("Error clearing route history:", error);
      Alert.alert("Error", "Could not clear route history.");
    }
  };

  const mapRegion = currentCoords
    ? {
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: -33.8688,
        longitude: 151.2093,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  const renderMapArea = () => {
    if (Platform.OS !== "web" && MapView) {
      return (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
            showsUserLocation
            showsMyLocationButton
          >
            {currentCoords && (
              <>
                <Marker
                  coordinate={currentCoords}
                  title="Your Location"
                  description="GPS position fetched by UniSafe"
                  pinColor="#EF3B45"
                />

                <Circle
                  center={currentCoords}
                  radius={150}
                  strokeColor="rgba(239,59,69,0.5)"
                  fillColor="rgba(239,59,69,0.08)"
                />
              </>
            )}
          </MapView>

          <View style={styles.mapBadge}>
            <Text style={styles.mapBadgeText}>
              {currentCoords ? "📍 Location pinned" : "Tap Get Location to pin"}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.mapFallback}>
        <Text style={styles.mapTitle}>Map available on mobile</Text>
        <Text style={styles.mapText}>
          React Native Maps renders your GPS location on Android/iOS. Use Expo
          Go, Android APK, or Firebase Test Lab to see the live map with your
          pinned location.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Safe travel</Text>
          <Text style={styles.title}>Safe Route / GPS</Text>
          <Text style={styles.subtitle}>
            Plan safer walking routes, view your location on the map, open
            directions in Google Maps, and save route history.
          </Text>
        </View>

        {renderMapArea()}

        <View style={styles.locationCard}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          <Text style={styles.locationText}>{locationText}</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={getCurrentLocation}
          >
            <Text style={styles.primaryButtonText}>
              {loadingLocation ? "Fetching Location..." : "Get Current Location"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Plan Safe Route</Text>
          <Text style={styles.sectionText}>
            Enter a destination to generate a safety-focused route preview.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter destination"
            value={destination}
            onChangeText={setDestination}
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handlePlanRoute}>
            <Text style={styles.primaryButtonText}>Plan Safe Route</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleOpenGoogleMaps}
          >
            <Text style={styles.secondaryButtonText}>Open in Google Maps</Text>
          </TouchableOpacity>

          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Route Preview</Text>
            <Text style={styles.previewText}>{routePreview}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.historyHeader}>
            <View style={styles.historyTitleBlock}>
              <Text style={styles.sectionTitle}>Route History</Text>
              <Text style={styles.sectionText}>
                Recently planned routes are stored using SQLite on mobile/APK.
              </Text>
            </View>

            <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={routeHistory}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {Platform.OS === "web"
                  ? "SQLite route history is available on mobile/APK."
                  : "No saved routes yet."}
              </Text>
            }
            renderItem={({ item }) => (
              <View style={styles.historyCard}>
                <Text style={styles.historyDestination}>{item.destination}</Text>
                <Text style={styles.historyPreview}>{item.routePreview}</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Mobile feature note</Text>
          <Text style={styles.noteText}>
            GPS, maps, and SQLite storage are native mobile features. The map
            renders live on Android/iOS with your current location pinned. Web
            preview uses a safe fallback.
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
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  mapContainer: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 18,
    height: 240,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  mapBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  mapBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  mapFallback: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 180,
    justifyContent: "center",
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  mapText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    textAlign: "center",
  },
  locationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  locationText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 14,
  },
  card: {
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
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 15,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
    color: "#111827",
  },
  primaryButton: {
    backgroundColor: "#EF3B45",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: "#111827",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
  previewBox: {
    backgroundColor: "#FFF5F6",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F6C8D1",
  },
  previewLabel: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  previewText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  historyTitleBlock: {
    flex: 1,
  },
  clearButton: {
    backgroundColor: "#111827",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  emptyText: {
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
  },
  historyCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    backgroundColor: "#F9FAFB",
  },
  historyDestination: {
    fontWeight: "900",
    fontSize: 16,
    color: "#111827",
    marginBottom: 6,
  },
  historyPreview: {
    color: "#6B7280",
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