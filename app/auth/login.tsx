import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>UniSafe</Text>
      <Text style={styles.subtitle}>Student Travel Safety App</Text>

      <Pressable style={styles.button} onPress={() => router.push("/auth/register")}>
        <Text style={styles.buttonText}>Go to Register</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => router.replace("/tabs/home")}>
        <Text style={styles.secondaryButtonText}>Enter App</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#F7F8F3",
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#6B7280",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#EF4444",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#E5E7EB",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 16,
  },
});