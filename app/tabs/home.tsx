import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Platform,
  TextInput,
  FlatList,
} from "react-native";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import * as SQLite from "expo-sqlite";
import * as Battery from "expo-battery";

type QuickRouteItem = {
  id: number;
  destination: string;
};

const localDb =
  Platform.OS === "web" ? null : SQLite.openDatabaseSync("unisafe.db");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [newDestination, setNewDestination] = useState("");
  const [quickRoutes, setQuickRoutes] = useState<QuickRouteItem[]>([]);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryState, setBatteryState] = useState<string>("Checking...");

  useEffect(() => {
    requestNotificationPermission();
    setupNotificationChannel();
    createQuickRoutesTable();
    loadQuickRoutes();
    loadBatteryInfo();
  }, []);

  const loadBatteryInfo = async () => {
    try {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();

      setBatteryLevel(Math.round(level * 100));

      if (state === Battery.BatteryState.CHARGING) {
        setBatteryState("Charging");
      } else if (state === Battery.BatteryState.FULL) {
        setBatteryState("Full");
      } else if (state === Battery.BatteryState.UNPLUGGED) {
        setBatteryState("Not Charging");
      } else {
        setBatteryState("Unknown");
      }
    } catch (error) {
      console.log("Error loading battery info:", error);
      setBatteryLevel(null);
      setBatteryState("Unavailable");
    }
  };

  const setupNotificationChannel = async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("check-in-reminders", {
        name: "Check-in reminders",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
      });
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== "granted") {
        console.log("Notification permission not granted.");
      }
    } catch (error) {
      console.log("Notification permission error:", error);
    }
  };

  const createQuickRoutesTable = () => {
    if (!localDb) return;

    try {
      localDb.execSync(`
        CREATE TABLE IF NOT EXISTS quick_routes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          destination TEXT NOT NULL
        );
      `);
    } catch (error) {
      console.log("Error creating quick_routes table:", error);
    }
  };

  const loadQuickRoutes = () => {
    if (!localDb) return;

    try {
      const result = localDb.getAllSync(
        "SELECT * FROM quick_routes ORDER BY id DESC;"
      ) as QuickRouteItem[];

      setQuickRoutes(result);
    } catch (error) {
      console.log("Error loading quick routes:", error);
    }
  };

  const addQuickRoute = () => {
    if (!newDestination.trim()) {
      Alert.alert("Missing destination", "Please enter a destination first.");
      return;
    }

    if (!localDb) {
      const previewRoute: QuickRouteItem = {
        id: Date.now(),
        destination: newDestination.trim(),
      };

      setQuickRoutes((prev) => [previewRoute, ...prev]);
      setNewDestination("");

      Alert.alert(
        "Saved for preview",
        "Quick route saved in web preview. SQLite storage works on mobile/APK."
      );
      return;
    }

    try {
      localDb.runSync("INSERT INTO quick_routes (destination) VALUES (?);", [
        newDestination.trim(),
      ]);

      setNewDestination("");
      loadQuickRoutes();

      Alert.alert("Saved", "Quick route destination added.");
    } catch (error) {
      console.log("Error saving quick route:", error);
      Alert.alert("Error", "Could not save quick route.");
    }
  };

  const deleteQuickRoute = (id: number) => {
    if (!localDb) {
      setQuickRoutes((prev) => prev.filter((route) => route.id !== id));
      return;
    }

    try {
      localDb.runSync("DELETE FROM quick_routes WHERE id = ?;", [id]);
      loadQuickRoutes();
    } catch (error) {
      console.log("Error deleting quick route:", error);
      Alert.alert("Error", "Could not delete quick route.");
    }
  };

  const confirmDeleteQuickRoute = (id: number, destination: string) => {
    Alert.alert("Delete Quick Route", `Do you want to delete "${destination}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteQuickRoute(id),
      },
    ]);
  };

  const scheduleCheckInReminder = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "UniSafe Check-In Reminder",
          body: "Please check in and confirm that you are safe.",
          sound: "default",
        },
        trigger: {
          seconds: 10,
        } as any,
      });

      Alert.alert(
        "Reminder scheduled",
        "A check-in reminder will appear in 10 seconds."
      );
    } catch (error) {
      Alert.alert("Error", "Could not schedule reminder.");
      console.log(error);
    }
  };

  const scheduleRouteCheckIn = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "UniSafe Route Check-In",
          body: "You started a walking route. Please confirm you are still safe.",
          sound: "default",
        },
        trigger: {
          seconds: 15,
        } as any,
      });

      Alert.alert(
        "Route check-in scheduled",
        "A route-based reminder will appear in 15 seconds."
      );
    } catch (error) {
      Alert.alert("Error", "Could not schedule route check-in.");
      console.log(error);
    }
  };

  const goToRoute = (destination: string) => {
    router.push({
      pathname: "/tabs/route",
      params: { destination },
    });
  };

  const showBackgroundTaskInfo = () => {
    Alert.alert(
      "Background Task Prototype",
      "This represents future background check-in support. In a full implementation, UniSafe could monitor route progress and trigger reminders automatically while the student is travelling."
    );
  };

  const showBatteryAwareInfo = () => {
    Alert.alert(
      "Battery-Aware GPS Prototype",
      "This represents battery-aware tracking behaviour. In a full version, UniSafe would reduce GPS polling when battery is low to save power while still supporting essential safety functions."
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
          <Text style={styles.heroLabel}>Student safety dashboard</Text>
          <Text style={styles.title}>UniSafe Home</Text>
          <Text style={styles.subtitle}>
            Quick access to safety tools, check-in reminders, route planning,
            and device-aware support.
          </Text>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Battery</Text>
            <Text style={styles.statusValue}>
              {batteryLevel !== null ? `${batteryLevel}%` : "N/A"}
            </Text>
            <Text style={styles.statusSubtext}>{batteryState}</Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Check-In</Text>
            <Text style={styles.statusValue}>Ready</Text>
            <Text style={styles.statusSubtext}>Reminder available</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Safety Check-In</Text>
          <Text style={styles.sectionText}>
            Schedule a local reminder to confirm you are safe during a walk.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={scheduleCheckInReminder}
          >
            <Text style={styles.primaryButtonText}>
              Schedule Check-In Reminder
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quick Safe Route</Text>
          <Text style={styles.sectionText}>
            Save common destinations and open them directly in the Route screen.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Library, Home, Station"
            value={newDestination}
            onChangeText={setNewDestination}
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity style={styles.primaryButton} onPress={addQuickRoute}>
            <Text style={styles.primaryButtonText}>Save Quick Route</Text>
          </TouchableOpacity>

          <FlatList
            data={quickRoutes}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No quick routes saved yet.</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.routeItem}
                onPress={() => goToRoute(item.destination)}
                onLongPress={() =>
                  confirmDeleteQuickRoute(item.id, item.destination)
                }
                delayLongPress={1200}
              >
                <View style={styles.routeTextBlock}>
                  <Text style={styles.routeTitle}>{item.destination}</Text>
                  <Text style={styles.routeSubtext}>
                    Tap to plan route • Long press to delete
                  </Text>
                </View>
                <Text style={styles.routeArrow}>›</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.routeList}
          />
        </View>

        <View style={styles.twoColumnGrid}>
          <TouchableOpacity style={styles.smallCard} onPress={scheduleRouteCheckIn}>
            <Text style={styles.smallCardTitle}>Route Check-In</Text>
            <Text style={styles.smallCardText}>
              Simulates a route-based reminder after a walk begins.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallCard} onPress={showBackgroundTaskInfo}>
            <Text style={styles.smallCardTitle}>Background Task</Text>
            <Text style={styles.smallCardText}>
              Explains future automatic safety monitoring.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.twoColumnGrid}>
          <TouchableOpacity style={styles.smallCard} onPress={showBatteryAwareInfo}>
            <Text style={styles.smallCardTitle}>Battery-Aware GPS</Text>
            <Text style={styles.smallCardText}>
              Explains low-power GPS polling behaviour.
            </Text>
          </TouchableOpacity>

          <View style={styles.smallCard}>
            <Text style={styles.smallCardTitle}>AdMob Placeholder</Text>
            <View style={styles.adPlaceholder}>
              <Text style={styles.adPlaceholderLabel}>TEST AD</Text>
              <Text style={styles.adPlaceholderText}>320 × 50 banner</Text>
            </View>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Mobile feature note</Text>
          <Text style={styles.noteText}>
            Battery, reminders, route planning, background-task explanation,
            AdMob placeholder, and SQLite storage are included for assessment
            evidence. Native features should be tested on Expo Go, APK, or
            Firebase Test Lab.
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
  statusRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  statusCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statusLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "900",
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 28,
    color: "#111827",
    fontWeight: "900",
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 12,
    color: "#6B7280",
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
    lineHeight: 21,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: "#EF3B45",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
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
  routeList: {
    marginTop: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 16,
    fontSize: 14,
  },
  routeItem: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  routeTextBlock: {
    flex: 1,
    paddingRight: 10,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  routeSubtext: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  routeArrow: {
    fontSize: 30,
    color: "#EF3B45",
    fontWeight: "900",
  },
  twoColumnGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  smallCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 130,
  },
  smallCardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  smallCardText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
  adPlaceholder: {
    height: 62,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#9CA3AF",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  adPlaceholderLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#4B5563",
    marginBottom: 2,
  },
  adPlaceholderText: {
    fontSize: 11,
    color: "#6B7280",
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