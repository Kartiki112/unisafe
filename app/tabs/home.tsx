import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  useEffect(() => {
    requestNotificationPermission();
    setupNotificationChannel();
  }, []);

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

  const scheduleCheckInReminder = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'UniSafe Check-In Reminder',
          body: 'Please check in and confirm that you are safe.',
          sound: 'default',
        },
        trigger: Platform.OS === 'android'
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>UniSafe Home</Text>
        <Text style={styles.subtitle}>
          This screen supports simple safety actions, including check-in reminders.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Check-In Reminder</Text>
          <Text style={styles.cardText}>
            Press the button below to schedule a local reminder notification.
          </Text>

          <TouchableOpacity style={styles.button} onPress={scheduleCheckInReminder}>
            <Text style={styles.buttonText}>Schedule Check-In Reminder</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    padding: 16,
    backgroundColor: '#fff',
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
  button: {
    backgroundColor: '#c53d5c',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});