import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

export const DietPreferences = () => {
  const [dietType, setDietType] = useState('');
  const [allergens, setAllergens] = useState('');
  const [restrictedIngredients, setRestrictedIngredients] = useState('');
  const [notes, setNotes] = useState('');
  const navgation = useNavigation();

  const handleSubmit = () => {
    const preferences = {
      dietType,
      allergens,
      restrictedIngredients,
      notes,
    };
    
    console.log('Preferences Submitted:', preferences);
    navgation.navigate('(tabs)')
    // You can handle form submission here, e.g., send data to the backend.
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Diet Preferences</Text>

      {/* Diet Type Picker */}
      <Text style={styles.label}>Select Diet Type:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={dietType}
          onValueChange={(value) => setDietType(value)}
        >
          <Picker.Item label="Select a diet type" value="" />
          <Picker.Item label="Vegetarian" value="vegetarian" />
          <Picker.Item label="Vegan" value="vegan" />
          <Picker.Item label="Pescatarian" value="pescatarian" />
          <Picker.Item label="Keto" value="keto" />
          <Picker.Item label="Paleo" value="paleo" />
        </Picker>
      </View>

      {/* Allergens Input */}
      <Text style={styles.label}>Allergens:</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., peanuts, dairy, gluten"
        value={allergens}
        onChangeText={setAllergens}
      />

      {/* Restricted Ingredients Input */}
      <Text style={styles.label}>Restricted Ingredients:</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., sugar, salt, processed food"
        value={restrictedIngredients}
        onChangeText={setRestrictedIngredients}
      />

      {/* Additional Notes Input */}
      <Text style={styles.label}>Additional Notes:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Any other preferences or notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DietPreferences;
