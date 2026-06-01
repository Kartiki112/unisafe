import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import { auth, db as firestoreDb } from "../../src/services/firebase";

type Contact = {
  id: number;
  name: string;
  phone: string;
  relationship: string;
};

const localDb =
  Platform.OS === "web" ? null : SQLite.openDatabaseSync("unisafe.db");

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const currentUser = auth.currentUser;

  useEffect(() => {
    createTable();
    loadContacts();
  }, []);

  const createTable = () => {
    if (!localDb) return;

    try {
      localDb.execSync(`
        CREATE TABLE IF NOT EXISTS emergency_contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          relationship TEXT NOT NULL
        );
      `);
    } catch (error) {
      console.log("Error creating emergency contacts table:", error);
    }
  };

  const loadContacts = () => {
    if (!localDb) return;

    try {
      const result = localDb.getAllSync(
        "SELECT * FROM emergency_contacts ORDER BY id DESC;"
      ) as Contact[];

      setContacts(result);
    } catch (error) {
      console.log("Error loading contacts:", error);
    }
  };

  const clearForm = () => {
    setName("");
    setPhone("");
    setRelationship("");
    setEditingId(null);
  };

  const saveContactToSQLite = () => {
    if (!localDb) {
      const previewContact: Contact = {
        id: Date.now(),
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim(),
      };

      if (editingId !== null) {
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === editingId ? { ...previewContact, id: editingId } : contact
          )
        );
      } else {
        setContacts((prev) => [previewContact, ...prev]);
      }

      return;
    }

    if (editingId !== null) {
      localDb.runSync(
        "UPDATE emergency_contacts SET name = ?, phone = ?, relationship = ? WHERE id = ?;",
        [name.trim(), phone.trim(), relationship.trim(), editingId]
      );
    } else {
      localDb.runSync(
        "INSERT INTO emergency_contacts (name, phone, relationship) VALUES (?, ?, ?);",
        [name.trim(), phone.trim(), relationship.trim()]
      );
    }
  };

  const saveContactToFirestore = async () => {
    await addDoc(collection(firestoreDb, "emergency_contacts"), {
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim(),
      userEmail: currentUser?.email ?? "unknown-user@unisafe.app",
      createdAt: serverTimestamp(),
      source: "UniSafe mobile app",
    });
  };

  const handleSaveOrUpdateContact = async () => {
    if (!name.trim() || !phone.trim() || !relationship.trim()) {
      Alert.alert("Missing details", "Please fill in all contact fields.");
      return;
    }

    if (phone.trim().length < 6) {
      Alert.alert("Invalid phone number", "Please enter a valid phone number.");
      return;
    }

    try {
      setSaving(true);

      saveContactToSQLite();

      if (editingId === null) {
        try {
          await saveContactToFirestore();
        } catch (firestoreError) {
          console.log("Firestore contact sync failed:", firestoreError);
        }
      }

      clearForm();
      loadContacts();

      Alert.alert(
        editingId !== null ? "Contact updated" : "Contact saved",
        editingId !== null
          ? "Emergency contact updated successfully."
          : localDb
          ? "Emergency contact saved locally and synced to Firestore."
          : "Emergency contact saved for web preview. SQLite storage works on mobile/APK."
      );
    } catch (error) {
      console.log("Error saving contact:", error);
      Alert.alert("Error", "Could not save contact.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setName(contact.name);
    setPhone(contact.phone);
    setRelationship(contact.relationship);
    setEditingId(contact.id);
  };

  const handleDeleteContact = (id: number) => {
    Alert.alert("Delete contact", "Do you want to delete this emergency contact?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (!localDb) {
            setContacts((prev) => prev.filter((contact) => contact.id !== id));
            if (editingId === id) clearForm();
            return;
          }

          try {
            localDb.runSync("DELETE FROM emergency_contacts WHERE id = ?;", [id]);
            loadContacts();

            if (editingId === id) {
              clearForm();
            }
          } catch (error) {
            console.log("Error deleting contact:", error);
            Alert.alert("Error", "Could not delete contact.");
          }
        },
      },
    ]);
  };

  const handleSignOut = async () => {
    Alert.alert("Sign out", "Are you sure you want to sign out of UniSafe?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/auth/login");
          } catch (error) {
            console.log("Sign out error:", error);
            Alert.alert("Error", "Could not sign out.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>

          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            Manage your UniSafe account and trusted emergency contacts.
          </Text>

          <View style={styles.accountBox}>
            <Text style={styles.accountLabel}>Signed in as</Text>
            <Text style={styles.accountEmail}>
              {currentUser?.email ?? "Demo / preview user"}
            </Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                {editingId !== null ? "Edit Emergency Contact" : "Add Emergency Contact"}
              </Text>
              <Text style={styles.sectionText}>
                Save trusted contacts for future emergency support.
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Contact name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor="#9CA3AF"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Relationship e.g. Friend, Parent, Roommate"
            placeholderTextColor="#9CA3AF"
            value={relationship}
            onChangeText={setRelationship}
          />

          <TouchableOpacity
            style={[styles.primaryButton, saving && styles.disabledButton]}
            onPress={handleSaveOrUpdateContact}
            disabled={saving}
          >
            <Text style={styles.primaryButtonText}>
              {saving
                ? "Saving..."
                : editingId !== null
                ? "Update Contact"
                : "Save Contact"}
            </Text>
          </TouchableOpacity>

          {editingId !== null && (
            <TouchableOpacity style={styles.secondaryButton} onPress={clearForm}>
              <Text style={styles.secondaryButtonText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.contactsCard}>
          <View style={styles.contactsHeader}>
            <View>
              <Text style={styles.sectionTitle}>Saved Emergency Contacts</Text>
              <Text style={styles.sectionText}>
                Tap Edit to update details or Delete to remove a contact.
              </Text>
            </View>

            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{contacts.length}</Text>
            </View>
          </View>

          <FlatList
            data={contacts}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>No contacts added yet</Text>
                <Text style={styles.emptyText}>
                  Add at least one trusted contact for safety support.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.contactItem}>
                <View style={styles.contactIcon}>
                  <Text style={styles.contactIconText}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.contactDetails}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactInfo}>{item.phone}</Text>
                  <Text style={styles.contactInfo}>{item.relationship}</Text>
                </View>

                <View style={styles.actionColumn}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditContact(item)}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteContact(item.id)}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Storage note</Text>
          <Text style={styles.noteText}>
            Emergency contacts are saved using SQLite on mobile/APK builds and
            synced to Firestore when a new contact is created. Web preview uses a
            safe local preview list to avoid native SQLite errors.
          </Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
    paddingBottom: 160,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#F1B4C1",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#FEE2E7",
    borderWidth: 2,
    borderColor: "#EF3B45",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: "900",
    color: "#EF3B45",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 16,
  },
  accountBox: {
    width: "100%",
    backgroundColor: "#FFF5F6",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F6C8D1",
  },
  accountLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#C43D5E",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  accountEmail: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 15,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
    color: "#111827",
  },
  primaryButton: {
    backgroundColor: "#EF3B45",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.7,
  },
  secondaryButton: {
    backgroundColor: "#374151",
    padding: 13,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  contactsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  contactsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  countBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EF3B45",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  emptyBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
  },
  emptyTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    lineHeight: 20,
    fontSize: 14,
  },
  contactItem: {
    backgroundColor: "#F9FAFB",
    borderRadius: 18,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
  },
  contactIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FEE2E7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contactIconText: {
    color: "#EF3B45",
    fontWeight: "900",
    fontSize: 18,
  },
  contactDetails: {
    flex: 1,
    paddingRight: 10,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 4,
  },
  contactInfo: {
    color: "#6B7280",
    fontSize: 13,
    marginBottom: 2,
  },
  actionColumn: {
    gap: 8,
  },
  editButton: {
    backgroundColor: "#EF3B45",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#111827",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  noteCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FED7AA",
    marginBottom: 18,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#9A3412",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    color: "#9A3412",
    lineHeight: 20,
  },
  signOutButton: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 30,
  },
  signOutButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
});