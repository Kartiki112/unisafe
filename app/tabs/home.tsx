import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import * as Battery from 'expo-battery';

type QuickRouteItem = {
  id: number;
  destination: string;
};

const db = SQLite.openDatabaseSync('unisafe.db');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [newDestination, setNewDestination] = useState('');
  const [quickRoutes, setQuickRoutes] = useState<QuickRouteItem[]>([]);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryState, setBatteryState] = useState<string>('Checking...');

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

      setBatteryLevel(Math.floor(level * 100));

      switch (state) {
        case Battery.BatteryState.CHARGING:
          setBatteryState('Charging');
          break;
        case Battery.BatteryState.FULL:
          setBatteryState('Full');
          break;
        case Battery.BatteryState.UNPLUGGED:
          setBatteryState('Not Charging');
          break;
        default:
          setBatteryState('Unknown');
      }
    } catch (error) {
      console.log('Error loading battery info:', error);
      setBatteryState('Unavailable');
    }
  };

  const setupNotificationChannel = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('check-in-reminders', {
        name: 'Check-in reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }
  };

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Notification permission is required for check-in reminders.'
      );
    }
  };

  const createQuickRoutesTable = () => {
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS quick_routes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          destination TEXT NOT NULL
        );
      `);
    } catch (error) {
      console.log('Error creating quick_routes table:', error);
    }
  };

  const loadQuickRoutes = () => {
    try {
      const result = db.getAllSync(
        'SELECT * FROM quick_routes ORDER BY id DESC;'
      ) as QuickRouteItem[];
      setQuickRoutes(result);
    } catch (error) {
      console.log('Error loading quick routes:', error);
    }
  };

  const addQuickRoute = () => {
    if (!newDestination.trim()) {
      Alert.alert('Missing destination', 'Please enter a destination first.');
      return;
    }

    try {
      db.runSync(
        'INSERT INTO quick_routes (destination) VALUES (?);',
        [newDestination.trim()]
      );
      setNewDestination('');
      loadQuickRoutes();
      Alert.alert('Saved', 'Quick route destination added.');
    } catch (error) {
      console.log('Error saving quick route:', error);
      Alert.alert('Error', 'Could not save quick route.');
    }
  };

  const deleteQuickRoute = (id: number) => {
    try {
      db.runSync('DELETE FROM quick_routes WHERE id = ?;', [id]);
      loadQuickRoutes();
    } catch (error) {
      console.log('Error deleting quick route:', error);
      Alert.alert('Error', 'Could not delete quick route.');
    }
  };

  const confirmDeleteQuickRoute = (id: number, destination: string) => {
    Alert.alert(
      'Delete Quick Route',
      `Do you want to delete "${destination}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteQuickRoute(id),
        },
      ]
    );
  };

  const scheduleCheckInReminder = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'UniSafe Check-In Reminder',
          body: 'Please check in and confirm that you are safe.',
          sound: 'default',
        },
        trigger:
          Platform.OS === 'android'
            ? {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 10,
                repeats: false,
                channelId: 'check-in-reminders',
              }
            : {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 10,
                repeats: false,
              },
      });

      Alert.alert(
        'Reminder scheduled',
        'A check-in reminder will appear in 10 seconds.'
      );
    } catch (error) {
      Alert.alert('Error', 'Could not schedule reminder.');
      console.log(error);
    }
  };

  const scheduleRouteCheckIn = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'UniSafe Route Check-In',
          body: 'You started a walking route. Please confirm you are still safe.',
          sound: 'default',
        },
        trigger:
          Platform.OS === 'android'
            ? {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 15,
                repeats: false,
                channelId: 'check-in-reminders',
              }
            : {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 15,
                repeats: false,
              },
      });

      Alert.alert(
        'Route check-in scheduled',
        'A route-based reminder will appear in 15 seconds.'
      );
    } catch (error) {
      Alert.alert('Error', 'Could not schedule route check-in.');
      console.log(error);
    }
  };

  const goToRoute = (destination: string) => {
    router.push({
      pathname: '/tabs/route',
      params: { destination },
    });
  };

  const showBackgroundTaskInfo = () => {
    Alert.alert(
      'Background Task Prototype',
      'This prototype represents future background check-in support. In a full implementation, UniSafe could monitor route progress and trigger reminders automatically while the student is travelling.'
    );
  };

  const showBatteryAwareInfo = () => {
    Alert.alert(
      'Battery-Aware GPS Prototype',
      'This prototype represents battery-aware tracking behaviour. In a full version, UniSafe would reduce location polling when the battery is low to save power while still supporting essential safety functions.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>UniSafe Home</Text>
        <Text style={styles.subtitle}>
          Use quick safety actions, reminders, and route planning tools from here.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Battery Status</Text>
          <Text style={styles.cardText}>
            Current battery level: {batteryLevel !== null ? `${batteryLevel}%` : 'Loading...'}
          </Text>
          <Text style={styles.cardText}>Battery state: {batteryState}</Text>

          <TouchableOpacity style={styles.button} onPress={loadBatteryInfo}>
            <Text style={styles.buttonText}>Refresh Battery Status</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Check-In Reminder</Text>
          <Text style={styles.cardText}>
            Press the button below to schedule a local reminder notification.
          </Text>

          <TouchableOpacity style={styles.button} onPress={scheduleCheckInReminder}>
            <Text style={styles.buttonText}>Schedule Check-In Reminder</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Safe Route</Text>
          <Text style={styles.cardText}>
            Add your own common destinations and open the Route screen with them pre-filled.
            Long press a saved route to delete it.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Add destination e.g. Home, Work, Station"
            value={newDestination}
            onChangeText={setNewDestination}
          />

          <TouchableOpacity style={styles.button} onPress={addQuickRoute}>
            <Text style={styles.buttonText}>Save Quick Route</Text>
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
                style={styles.routeOpenButton}
                onPress={() => goToRoute(item.destination)}
                onLongPress={() => confirmDeleteQuickRoute(item.id, item.destination)}
                delayLongPress={1500}
              >
                <Text style={styles.buttonText}>Plan Route to {item.destination}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ marginTop: 12 }}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Route Check-In Prototype</Text>
          <Text style={styles.cardText}>
            This simulates a route-based reminder that can check on the user after a walking journey begins.
          </Text>

          <TouchableOpacity style={styles.button} onPress={scheduleRouteCheckIn}>
            <Text style={styles.buttonText}>Schedule Route Check-In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Background Task Placeholder</Text>
          <Text style={styles.cardText}>
            This section explains how background safety monitoring could work in a future version.
          </Text>

          <TouchableOpacity style={styles.button} onPress={showBackgroundTaskInfo}>
            <Text style={styles.buttonText}>View Background Task Info</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Battery-Aware GPS Placeholder</Text>
          <Text style={styles.cardText}>
            This section explains how battery-aware GPS polling could reduce power use while travelling.
          </Text>

          <TouchableOpacity style={styles.button} onPress={showBatteryAwareInfo}>
            <Text style={styles.buttonText}>View Battery-Aware Info</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>AdMob Placeholder</Text>
          <Text style={styles.cardText}>
            This is a placeholder area showing where a banner advertisement could appear in the final app.
          </Text>

          <View style={styles.adPlaceholder}>
            <Text style={styles.adPlaceholderLabel}>TEST AD / ADMOB PLACEHOLDER</Text>
            <Text style={styles.adPlaceholderText}>Banner area 320 × 50</Text>
          </View>
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
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 14,
    padding: 18,
    backgroundColor: '#fafafa',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 18,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#c53d5c',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  routeOpenButton: {
    backgroundColor: '#c53d5c',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  adPlaceholder: {
    height: 70,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#999',
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  adPlaceholderLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
    marginBottom: 4,
  },
  adPlaceholderText: {
    fontSize: 13,
    color: '#666',
  },
});