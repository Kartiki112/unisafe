import { Accelerometer } from "expo-sensors";
import { useEffect, useState } from "react";
import {Alert,Platform,Pressable,ScrollView,StyleSheet,Text,View,} from "react-native";

import { useAuth } from "../../src/context/AuthContext";
import { showSosSentNotification } from "../../src/services/notificationService";
import { sendSosAlert } from "../../src/services/sosService";
import {speakShakeDetected,speakSosCancelled,speakSosSent,} from "../../src/services/speechService";

export default function SOSScreen() {
  const { user } = useAuth();

  const [sending, setSending] = useState(false);
  const [lastAlertId, setLastAlertId] = useState<string | null>(null);
  const [strobeActive, setStrobeActive] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(true);

  async function handleSendSos(triggerType: "hold_button" | "shake") {
    if (sending) return;

    try {
      setSending(true);
      setStrobeActive(true);

      const alertId = await sendSosAlert({
        userEmail: user?.email ?? "demo-user@unisafe.app",
        triggerType,
        status: "sent",
        message: "Student triggered an SOS alert from UniSafe.",
      });

      setLastAlertId(alertId);

      await showSosSentNotification();
      speakSosSent();

      Alert.alert(
        "SOS alert sent",
        "Your SOS alert has been saved successfully in Firestore."
      );
    } catch (error: any) {
      console.log("SOS error:", error);

      Alert.alert(
        "SOS failed",
        error?.message ?? "Unable to send SOS alert. Please try again."
      );
    } finally {
      setSending(false);

      setTimeout(() => {
        setStrobeActive(false);
      }, 3000);
    }
  }

  useEffect(() => {
    if (!shakeEnabled) return;

    // Web preview does not support Expo accelerometer properly.
    // This prevents crashing when testing in browser.
    if (Platform.OS === "web") {
      console.log("Shake detection is disabled on web preview.");
      return;
    }

    if (typeof Accelerometer.addListener !== "function") {
      console.log("Accelerometer is not available on this device.");
      return;
    }

    Accelerometer.setUpdateInterval(600);

    const subscription = Accelerometer.addListener((data) => {
      const totalForce = Math.sqrt(
        data.x * data.x + data.y * data.y + data.z * data.z
      );

      if (totalForce > 2.2 && !sending) {
        setShakeEnabled(false);

        speakShakeDetected();

        Alert.alert("Shake detected", "Do you want to send an SOS alert?", [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              speakSosCancelled();
              setShakeEnabled(true);
            },
          },
          {
            text: "Send SOS",
            style: "destructive",
            onPress: async () => {
              await handleSendSos("shake");
              setShakeEnabled(true);
            },
          },
        ]);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [shakeEnabled, sending]);

  return (
    <ScrollView
      style={[styles.screen, strobeActive && styles.strobeBackground]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.appName}>UniSafe</Text>
        <Text style={styles.title}>Emergency SOS</Text>
        <Text style={styles.subtitle}>
          Hold the SOS button to send an emergency alert. The alert is saved in
          Firebase Firestore and confirmed using notification and speech
          feedback.
        </Text>
      </View>

      <View style={styles.sosCard}>
        <View style={[styles.sosCircle, strobeActive && styles.sosCircleActive]}>
          <Text style={styles.sosText}>SOS</Text>
        </View>

        <Text style={styles.cardTitle}>Need help?</Text>

        <Text style={styles.cardText}>
          Press and hold the button for 1.2 seconds. UniSafe will record your
          SOS alert in Firestore and give notification and voice feedback.
        </Text>

        <Pressable
          style={[styles.sosButton, sending && styles.disabledButton]}
          onLongPress={() => handleSendSos("hold_button")}
          delayLongPress={1200}
          disabled={sending}
        >
          <Text style={styles.sosButtonText}>
            {sending ? "Sending SOS..." : "Hold to Send SOS"}
          </Text>
        </Pressable>

        <Text style={styles.noteText}>
          Shake-to-SOS and voice feedback work best on a physical phone. Shake
          detection is safely disabled on web preview.
        </Text>
      </View>

      <View style={styles.evidenceCard}>
        <Text style={styles.evidenceTitle}>Sprint 2 evidence</Text>

        <View style={styles.row}>
          <Text style={styles.tick}>✓</Text>
          <Text style={styles.rowText}>Hold-to-send SOS interaction</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.tick}>✓</Text>
          <Text style={styles.rowText}>Firestore write to sos_alerts</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.tick}>✓</Text>
          <Text style={styles.rowText}>Local notification after SOS send</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.tick}>✓</Text>
          <Text style={styles.rowText}>Shake detection prepared for phone</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.tick}>✓</Text>
          <Text style={styles.rowText}>
            Speech synthesis feedback for shake and SOS confirmation
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.tick}>✓</Text>
          <Text style={styles.rowText}>Visual SOS strobe fallback</Text>
        </View>

        {lastAlertId ? (
          <View style={styles.alertBox}>
            <Text style={styles.alertLabel}>Last Firestore alert ID:</Text>
            <Text style={styles.alertId}>{lastAlertId}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8F3",
  },

  strobeBackground: {
    backgroundColor: "#FEE2E2",
  },

  content: {
    padding: 20,
    paddingBottom: 180,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
  },

  header: {
    marginTop: 24,
    marginBottom: 20,
  },

  appName: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 6,
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 22,
    marginTop: 8,
  },

  sosCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 2,
    borderColor: "#F28B8B",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  sosCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },

  sosCircleActive: {
    borderWidth: 8,
    borderColor: "#FECACA",
  },

  sosText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 24,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
    marginTop: 16,
  },

  cardText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },

  sosButton: {
    width: "100%",
    backgroundColor: "#EF4444",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 22,
  },

  disabledButton: {
    opacity: 0.6,
  },

  sosButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 17,
  },

  noteText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 14,
    textAlign: "center",
  },

  evidenceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  evidenceTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  tick: {
    color: "#16A34A",
    fontSize: 18,
    fontWeight: "900",
    marginRight: 10,
  },

  rowText: {
    fontSize: 15,
    color: "#374151",
    flex: 1,
  },

  alertBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
  },

  alertLabel: {
    color: "#374151",
    fontWeight: "800",
    marginBottom: 4,
  },

  alertId: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700",
  },
});