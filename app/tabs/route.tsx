import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function RouteScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.appName}>UniSafe</Text>
        <Text style={styles.title}>Safe Route</Text>
        <Text style={styles.subtitle}>
          Plan a safer walking route and save route history for later review.
        </Text>
      </View>

      <View style={styles.mapPreview}>
        <MaterialCommunityIcons
          name="map-marker-path"
          size={64}
          color="#1565C0"
        />
        <Text style={styles.mapText}>Google Maps route preview</Text>
        <Text style={styles.mapSubText}>GPS and directions will be added in Sprint 2.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sprint 1 status</Text>

        <View style={styles.row}>
          <Text style={styles.dot}>✓</Text>
          <Text style={styles.rowText}>Route screen created</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.dot}>✓</Text>
          <Text style={styles.rowText}>Navigation connected through bottom tabs</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.pendingDot}>•</Text>
          <Text style={styles.rowText}>Destination search planned for Sprint 2</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.pendingDot}>•</Text>
          <Text style={styles.rowText}>SQLite route history planned for Sprint 2</Text>
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
    paddingBottom: 120,
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
    fontWeight: "800",
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
  mapPreview: {
    height: 260,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  mapText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginTop: 12,
  },
  mapSubText: {
    fontSize: 14,
    color: "#6B7280",
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
  dot: {
    color: "#16A34A",
    fontSize: 18,
    fontWeight: "900",
    marginRight: 10,
  },
  pendingDot: {
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