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

  const handleAddContact = () => {
    if (!name.trim() || !phone.trim() || !relationship.trim()) {
      Alert.alert('Missing details', 'Please fill in all contact fields.');
      return;
    }

    try {
      db.runSync(
        'INSERT INTO emergency_contacts (name, phone, relationship) VALUES (?, ?, ?);',
        [name.trim(), phone.trim(), relationship.trim()]
      );

      setName('');
      setPhone('');
      setRelationship('');
      loadContacts();
      Alert.alert('Saved', 'Emergency contact added successfully.');
    } catch (error) {
      console.log('Error adding contact:', error);
      Alert.alert('Error', 'Could not save contact.');
    }
  };

  const handleDeleteContact = (id: number) => {
    try {
      db.runSync('DELETE FROM emergency_contacts WHERE id = ?;', [id]);
      loadContacts();
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
          Add trusted people you want UniSafe to reach in an emergency.
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

        <TouchableOpacity style={styles.saveButton} onPress={handleAddContact}>
          <Text style={styles.saveButtonText}>Save Contact</Text>
        </TouchableOpacity>

        <FlatList
          data={contacts}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No emergency contacts added yet.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTextArea}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardInfo}>{item.phone}</Text>
                <Text style={styles.cardInfo}>{item.relationship}</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteContact(item.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  saveButton: {
    backgroundColor: '#c53d5c',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 18,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
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
  },
  cardTextArea: {
    flex: 1,
    marginRight: 10,
  },
  cardName: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  cardInfo: {
    color: '#555',
  },
  deleteButton: {
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});