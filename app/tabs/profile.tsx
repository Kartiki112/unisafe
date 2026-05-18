import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import * as SQLite from 'expo-sqlite';

type Contact = {
  id: number;
  name: string;
  phone: string;
  relationship: string;
};

const db = SQLite.openDatabaseSync('unisafe.db');

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    createTable();
    loadContacts();
  }, []);

  const createTable = () => {
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS emergency_contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          relationship TEXT NOT NULL
        );
      `);
    } catch (error) {
      console.log('Error creating table:', error);
    }
  };

  const loadContacts = () => {
    try {
      const result = db.getAllSync(
        'SELECT * FROM emergency_contacts ORDER BY id DESC;'
      ) as Contact[];
      setContacts(result);
    } catch (error) {
      console.log('Error loading contacts:', error);
    }
  };

  const clearForm = () => {
    setName('');
    setPhone('');
    setRelationship('');
    setEditingId(null);
  };

  const handleSaveOrUpdateContact = () => {
    if (!name.trim() || !phone.trim() || !relationship.trim()) {
      Alert.alert('Missing details', 'Please fill in all contact fields.');
      return;
    }

    try {
      if (editingId !== null) {
        db.runSync(
          'UPDATE emergency_contacts SET name = ?, phone = ?, relationship = ? WHERE id = ?;',
          [name.trim(), phone.trim(), relationship.trim(), editingId]
        );
        Alert.alert('Updated', 'Emergency contact updated successfully.');
      } else {
        db.runSync(
          'INSERT INTO emergency_contacts (name, phone, relationship) VALUES (?, ?, ?);',
          [name.trim(), phone.trim(), relationship.trim()]
        );
        Alert.alert('Saved', 'Emergency contact added successfully.');
      }

      clearForm();
      loadContacts();
    } catch (error) {
      console.log('Error saving contact:', error);
      Alert.alert('Error', 'Could not save contact.');
    }
  };

  const handleEditContact = (contact: Contact) => {
    setName(contact.name);
    setPhone(contact.phone);
    setRelationship(contact.relationship);
    setEditingId(contact.id);
  };

  const handleDeleteContact = (id: number) => {
    try {
      db.runSync('DELETE FROM emergency_contacts WHERE id = ?;', [id]);
      loadContacts();
      if (editingId === id) {
        clearForm();
      }
    } catch (error) {
      console.log('Error deleting contact:', error);
      Alert.alert('Error', 'Could not delete contact.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile & Emergency Contacts</Text>
        <Text style={styles.subtitle}>
          Manage trusted contacts that UniSafe can use in an emergency.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>
            {editingId !== null ? 'Edit Contact' : 'Add Emergency Contact'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Contact name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Relationship"
            value={relationship}
            onChangeText={setRelationship}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveOrUpdateContact}>
            <Text style={styles.saveButtonText}>
              {editingId !== null ? 'Update Contact' : 'Save Contact'}
            </Text>
          </TouchableOpacity>

          {editingId !== null && (
            <TouchableOpacity style={styles.cancelButton} onPress={clearForm}>
              <Text style={styles.cancelButtonText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Saved Emergency Contacts</Text>

          <FlatList
            data={contacts}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No emergency contacts added yet. Add at least one trusted contact for safety support.
              </Text>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardTextArea}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardInfo}>Phone: {item.phone}</Text>
                  <Text style={styles.cardInfo}>Relationship: {item.relationship}</Text>
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
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 18,
  },
  formCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  listSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#c53d5c',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cardTextArea: {
    flex: 1,
    marginRight: 12,
  },
  cardName: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  cardInfo: {
    color: '#555',
    marginBottom: 2,
  },
  actionColumn: {
    justifyContent: 'center',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});