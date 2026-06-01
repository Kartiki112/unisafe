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
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

const BACKGROUND_CHECK_IN_TASK = "unisafe-background-checkin";

TaskManager.defineTask(BACKGROUND_CHECK_IN_TASK, async () => {
  try {
    console.log("[UniSafe] Background check-in task running...");

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "UniSafe Background Check-In",
        body: "Background safety check: Are you still safe? Open UniSafe to confirm.",
        sound: "default",
      },
      trigger: null,
    });

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.log("[UniSafe] Background task error:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

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
  const [backgroundTaskRegistered, setBackgroundTaskRegistered] =
    useState(false);

  useEffect(() => {
    requestNotificationPermission();
    setupNotificationChannel();
    createQuickRoutesTable();
    loadQuickRoutes();
    loadBatteryInfo();
    checkBackgroundTaskStatus();
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
      const permission = await Notifications.requestPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow notifications to use check-in reminders."
        );
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "UniSafe Check-In Reminder",
          body: "Please check in and confirm that you are safe.",
          sound: "default",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 10,
          repeats: false,
        },
      });

      Alert.alert(
        "Reminder scheduled",
        "A check-in reminder will appear in 10 seconds."
      );
    } catch (error) {
      console.log("Check-in reminder error:", error);

      Alert.alert(
        "Notification not available",
        "Check-in reminders work best on Android APK or a physical mobile build. The app handled this safely without crashing."
      );
    }
  };

  const scheduleRouteCheckIn = async () => {
    try {
      const permission = await Notifications.requestPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow notifications to use route check-ins."
        );
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "UniSafe Route Check-In",
          body: "You started a walking route. Please confirm you are still safe.",
          sound: "default",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 15,
          repeats: false,
        },
      });

      Alert.alert(
        "Route check-in scheduled",
        "A route-based reminder will appear in 15 seconds."
      );
    } catch (error) {
      console.log("Route check-in error:", error);

      Alert.alert(
        "Notification not available",
        "Route check-ins work best on Android APK or a physical mobile build. The app handled this safely without crashing."
      );
    }
  };

  const goToRoute = (destination: string) => {
    router.push({
      pathname: "/tabs/route",
      params: { destination },
    });
  };

  const checkBackgroundTaskStatus = async () => {
    try {
      if (Platform.OS === "web") return;

      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_CHECK_IN_TASK
      );

      setBackgroundTaskRegistered(isRegistered);
    } catch (error) {
      console.log("Error checking background task status:", error);
    }
  };

  const registerBackgroundTask = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Mobile feature",
        "Background tasks should be tested on Expo Go, Android APK, or Firebase Test Lab."
      );
      return;
    }

    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_CHECK_IN_TASK
      );

      if (isRegistered) {
        setBackgroundTaskRegistered(true);
        Alert.alert(
          "Already active",
          "Background check-ins are already registered."
        );
        return;
      }

      await BackgroundFetch.registerTaskAsync(BACKGROUND_CHECK_IN_TASK, {
        minimumInterval: 60 * 15,
        stopOnTerminate: false,
        startOnBoot: true,
      });

      setBackgroundTaskRegistered(true);

      Alert.alert(
        "Background task registered",
        "UniSafe will request periodic safety check-ins in the background."
      );
    } catch (error) {
      console.log("Background task registration error:", error);

      Alert.alert(
        "Background task requires native build",
        "BackgroundFetch needs native mobile configuration. This should be tested on an Android APK or development build."
      );
    }
  };

  const unregisterBackgroundTask = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Mobile feature",
        "Background task stopping should be tested on mobile/APK."
      );
      return;
    }

    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_CHECK_IN_TASK
      );

      if (!isRegistered) {
        setBackgroundTaskRegistered(false);
        Alert.alert("Not active", "Background check-ins are not registered.");
        return;
      }

      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_CHECK_IN_TASK);
      setBackgroundTaskRegistered(false);

      Alert.alert(
        "Background task stopped",
        "Periodic background check-ins have been disabled."
      );
    } catch (error) {
      console.log("Error unregistering background task:", error);
      Alert.alert("Error", "Could not stop background task.");
    }
  };

  const showBatteryAwareInfo = () => {
    Alert.alert(
      "Battery-Aware GPS",
      "This demonstrates battery-aware behaviour. In a full version, UniSafe would reduce GPS polling when battery is low to save power while still supporting safety functions."
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
          <Text style={styles.sectionTitle}>Background Safety Monitor</Text>
          <Text style={styles.sectionText}>
            Uses Expo TaskManager and BackgroundFetch to register a periodic
            background check-in task. This demonstrates background execution
            separate from the foreground UI.
          </Text>

          <View style={styles.taskStatusRow}>
            <View
              style={[
                styles.taskStatusDot,
                backgroundTaskRegistered
                  ? styles.taskStatusActive
                  : styles.taskStatusInactive,
              ]}
            />
            <Text style={styles.taskStatusText}>
              {backgroundTaskRegistered
                ? "Background task: ACTIVE"
                : "Background task: NOT REGISTERED"}
            </Text>
          </View>

          {!backgroundTaskRegistered ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={registerBackgroundTask}
            >
              <Text style={styles.primaryButtonText}>
                Start Background Check-Ins
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={unregisterBackgroundTask}
            >
              <Text style={styles.primaryButtonText}>
                Stop Background Check-Ins
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={scheduleRouteCheckIn}
          >
            <Text style={styles.secondaryButtonText}>
              Trigger Route Check-In 15s
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
          <TouchableOpacity style={styles.smallCard} onPress={showBatteryAwareInfo}>
            <Text style={styles.smallCardTitle}>Battery-Aware GPS</Text>
            <Text style={styles.smallCardText}>
              Explains low-power GPS behaviour when battery is low.
            </Text>
          </TouchableOpacity>

          <View style={styles.smallCard}>
            <Text style={styles.smallCardTitle}>AdMob Banner</Text>
            <View style={styles.adContainer}>
              <Text style={styles.adLabel}>ADMOB TEST AD</Text>
              <Text style={styles.adUnitText}>
                ca-app-pub-3940256099942544/6300978111
              </Text>
              <Text style={styles.adSizeText}>BannerAdSize.BANNER · 320×50</Text>
            </View>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Implementation note</Text>
          <Text style={styles.noteText}>
            Background tasks use TaskManager and BackgroundFetch to demonstrate
            parallel/background execution. AdMob is represented with Google’s
            official test ad unit ID and should be replaced with a real native
            AdMob component in a production build.
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
  taskStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  taskStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  taskStatusActive: {
    backgroundColor: "#16A34A",
  },
  taskStatusInactive: {
    backgroundColor: "#9CA3AF",
  },
  taskStatusText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
  },
  primaryButton: {
    backgroundColor: "#EF3B45",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  dangerButton: {
    backgroundColor: "#374151",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "800",
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
    minHeight: 150,
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
  adContainer: {
    flex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#9CA3AF",
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
    minHeight: 90,
  },
  adLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#374151",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  adUnitText: {
    fontSize: 8,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 2,
  },
  adSizeText: {
    fontSize: 9,
    color: "#9CA3AF",
    textAlign: "center",
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