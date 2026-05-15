import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Register to access UniSafe features.</Text>

      <Pressable style={styles.button} onPress={() => router.push("/auth/login")}>
        <Text style={styles.buttonText}>Back to Login</Text>
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
    fontSize: 34,
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
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});