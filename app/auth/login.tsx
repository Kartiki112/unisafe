import { useState } from "react";
import {
  Alert,
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
import { validateLogin } from "../../src/utils/validation";

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const error = validateLogin(email, password);

    if (error) {
      Alert.alert("Login error", error);
      return;
    }

    try {
      await login(email.trim(), password);
      router.replace("/tabs/home");
   } catch (error: any) {
  console.log("Login error:", error);

  Alert.alert(
    "Login failed",
    error?.message ?? "Please check your email and password."
  );
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Login to access your student travel safety tools.
          </Text>

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

          <Pressable style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Login</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/auth/register")}>
            <Text style={styles.linkText}>New to UniSafe? Create account</Text>
          </Pressable>

          <Pressable onPress={() => router.replace("/tabs/home")}>
            <Text style={styles.demoText}>Demo mode: Enter app without login</Text>
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
  primaryButton: {
    backgroundColor: "#EF4444",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 4,
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
  demoText: {
    textAlign: "center",
    color: "#6B7280",
    fontWeight: "700",
    marginTop: 14,
  },
});