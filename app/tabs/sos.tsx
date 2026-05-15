import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function SOSScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.appName}>UniSafe</Text>
        <Text style={styles.title}>Emergency SOS</Text>
        <Text style={styles.subtitle}>
          Quickly trigger an emergency alert during unsafe travel situations.
        </Text>
      </View>

      <View style={styles.sosHero}>
        <View style={styles.sosCircle}>
          <Text style={styles.sosText}>SOS</Text>
        </View>
        <Text style={styles.heroTitle}>SOS Safety Feature</Text>
        <Text style={styles.heroText}>
          Hold-to-send, shake trigger, torch strobe, Firestore alert, and notification will be completed in Sprint 2.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sprint 1 status</Text>

        <View style={styles.row}>
          <Text style={styles.done}>✓</Text>
          <Text style={styles.rowText}>SOS screen created</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.done}>✓</Text>
          <Text style={styles.rowText}>SOS centre tab added to navigation</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.pending}>•</Text>
          <Text style={styles.rowText}>Accelerometer shake detection planned for Sprint 2</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.pending}>•</Text>
          <Text style={styles.rowText}>Firestore alert write planned for Sprint 2</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8F3",
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
  sosHero: {
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
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 22,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginTop: 16,
  },
  heroText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 6,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: {
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
  done: {
    color: "#16A34A",
    fontSize: 18,
    fontWeight: "900",
    marginRight: 10,
  },
  pending: {
    color: "#F59E0B",
    fontSize: 24,
    fontWeight: "900",
    marginRight: 10,
  },
  rowText: {
    fontSize: 15,
    color: "#374151",
    flex: 1,
  },
});