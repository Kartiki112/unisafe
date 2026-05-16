import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { validateRegister } from "../../src/utils/validation";

export default function RegisterScreen() {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setErrorMessage("");

    const error = validateRegister(name, email, password, confirmPassword);

    if (error) {
      setErrorMessage(error);
      return;
    }

    try {
      setLoading(true);

      await register(email.trim(), password);

      router.replace("/tabs/home");
    } catch (error: any) {
      console.log("Registration error:", error);

      setErrorMessage(
        error?.message ?? "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.appName}>UniSafe</Text>

          <Text style={styles.title}>Create account</Text>

          <Text style={styles.subtitle}>
            Register to access emergency, route, and reporting features.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Full name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email address"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <Pressable
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Creating account..." : "Create Account"}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.push("/auth/login")}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8F3",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  appName: {
    color: "#EF4444",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 24,
  },

  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  errorText: {
    color: "#B91C1C",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 12,
    fontWeight: "700",
    marginBottom: 14,
  },

  primaryButton: {
    backgroundColor: "#EF4444",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 4,
  },

  disabledButton: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  linkText: {
    textAlign: "center",
    color: "#1565C0",
    fontWeight: "800",
    marginTop: 18,
  },
});