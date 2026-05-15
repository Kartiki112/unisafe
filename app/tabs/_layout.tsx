import { Tabs } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";

function TabIcon({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
      {children}
    </View>
  );
}

function SosTabIcon() {
  return (
    <View style={styles.sosWrapper}>
      <View style={styles.sosCircle}>
        <Text style={styles.sosText}>SOS</Text>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#1565C0",
        tabBarInactiveTintColor: "#3F3F46",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused}>
              <Ionicons name="home-outline" size={25} color={color} />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="route"
        options={{
          title: "Route",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused}>
              <MaterialCommunityIcons
                name="map-marker-path"
                size={26}
                color={color}
              />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="sos"
        options={{
          title: "",
          tabBarIcon: () => <SosTabIcon />,
        }}
      />

      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused}>
              <Feather name="flag" size={25} color={color} />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused}>
              <Feather name="user" size={25} color={color} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
    height: 82,
    maxWidth: 520,
    alignSelf: "center",
    marginHorizontal: "auto" as any,

    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderTopWidth: 0,

    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  tabItem: {
    height: 62,
    justifyContent: "center",
    alignItems: "center",
  },

  tabLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F3F1EC",
    alignItems: "center",
    justifyContent: "center",
  },

  iconBoxActive: {
    backgroundColor: "#E3F0FF",
  },

  sosWrapper: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -26,
  },

  sosCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "#FFFFFF",

    shadowColor: "#EF4444",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  sosText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});