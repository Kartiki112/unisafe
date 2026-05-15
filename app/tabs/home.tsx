import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

function FeatureCard({
  title,
  description,
  icon,
  highlight,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.card, highlight && styles.highlightCard]}>
      <View style={[styles.iconWrap, highlight && styles.highlightIcon]}>
        {icon}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>{description}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.appName}>UniSafe</Text>
        <Text style={styles.title}>Student Travel Safety</Text>
        <Text style={styles.subtitle}>
          A mobile safety app for students travelling around campus and at night.
        </Text>
      </View>

      <View style={styles.heroCard}>
        <MaterialCommunityIcons
          name="map-marker-radius-outline"
          size={60}
          color="#1565C0"
        />
        <Text style={styles.heroTitle}>Sprint 1 App Foundation</Text>
        <Text style={styles.heroText}>
          Navigation, screens, authentication structure, and project architecture.
        </Text>
      </View>

      <FeatureCard
        title="Home"
        description="Live GPS map, battery indicator, torch toggle, and AdMob banner planned."
        icon={<Ionicons name="home-outline" size={30} color="#1565C0" />}
      />

      <FeatureCard
        title="Route"
        description="Safe route planning, destination search, and SQLite route history."
        icon={
          <MaterialCommunityIcons
            name="map-marker-path"
            size={30}
            color="#333"
          />
        }
      />

      <FeatureCard
        title="SOS"
        description="Hold-to-send alert, shake trigger, torch strobe, Firestore write, and local notification."
        highlight
        icon={
          <View style={styles.sosMini}>
            <Text style={styles.sosMiniText}>SOS</Text>
          </View>
        }
      />

      <FeatureCard
        title="Report"
        description="Hazard reporting with Firestore, SQLite offline fallback, and GPS-tagged reports."
        icon={<Feather name="flag" size={30} color="#333" />}
      />

      <FeatureCard
        title="Profile"
        description="Emergency contacts, account settings, and sign out."
        icon={<Feather name="user" size={30} color="#333" />}
      />
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
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  highlightCard: {
    borderColor: "#F28B8B",
    borderWidth: 2,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#F3F1EC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  highlightIcon: {
    backgroundColor: "#FEE2E2",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  sosMini: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  sosMiniText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
  },
});