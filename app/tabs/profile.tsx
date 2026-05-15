import { useAuth } from "../../src/context/AuthContext";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/auth/login");
  }
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.appName}>UniSafe</Text>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Manage account settings and emergency contact information.
        </Text>
      </View>

      <View style={styles.heroCard}>
        <Feather name="user" size={58} color="#1565C0" />
        <Text style={styles.heroTitle}>Emergency Profile</Text>
        <Text style={styles.heroText}>
          Emergency contacts and account settings will be completed in Sprint 2.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sprint 1 status</Text>

        <View style={styles.row}>
          <Text style={styles.done}>✓</Text>
          <Text style={styles.rowText}>Profile screen created</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.done}>✓</Text>
          <Text style={styles.rowText}>Basic sign-out navigation placeholder added</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.pending}>•</Text>
          <Text style={styles.rowText}>Emergency contacts planned for Sprint 2</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.pending}>•</Text>
          <Text style={styles.rowText}>Firestore + SQLite contact sync planned for Sprint 2</Text>
        </View>
      </View>

     <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>
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
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginTop: 12,
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
    marginBottom: 18,
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
  logoutButton: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});