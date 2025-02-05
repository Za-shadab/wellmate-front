import React from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const data = [
  { id: '1', name: 'White rice, cooked', calories: '121 cal', quantity: '1.0 cup' },
  { id: '2', name: 'Roti', calories: '120 cal', quantity: '1.0 medium' },
  { id: '3', name: '1 Whole Wheat Chapati', calories: '72 cal', quantity: '0.4 Whole' },
  { id: '4', name: 'Chapati', calories: '120 cal', quantity: '50.0 gram' },
];

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Meal</Text>
      <TextInput style={styles.searchBar} placeholder="Search for a food" />

      <Text style={styles.sectionHeader}>History</Text>
      <View style={styles.historyItem}>
        <Text style={styles.itemText}>White rice, cooked</Text>
        <Text style={styles.itemSubText}>121 cal, 1.0 cup</Text>
        <TouchableOpacity>
          <Ionicons name="add-circle-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionHeader}>Suggestions</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.suggestionItem}>
            <View>
            <Text style={styles.itemText}>{item.name}</Text>
            <Text style={styles.itemSubText}>{item.calories}, {item.quantity}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="add-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 8,
    color: 'blue',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor:'#dddd',
    padding:'10',
    borderRadius:10
  },
  itemText: {
    fontSize: 16,
  },
  itemSubText: {
    color: '#888',
  },
});

export default App;
