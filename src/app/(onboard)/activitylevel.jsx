import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, useNavigation } from 'expo-router';
import { useRegistrationContext } from '../context/RegistrationContext';

const ActivityLevelScreen = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigation = useNavigation();
  const [selected, setselected] = useState(false);
  const { registrationData, updateRegistrationData } = useRegistrationContext({});
  useEffect(()=>{
    console.log("Context Information....................................", registrationData);
  },[registrationData])

  const options = [
    { label: 'Not Very Active', description: 'Spend most of the day sitting (e.g., bankteller, desk job).' },
    { label: 'Lightly Active', description: 'Spend a good part of the day on your feet (e.g., teacher, salesperson).' },
    { label: 'Active', description: 'Spend a good part of the day doing some physical activity (e.g., food server, postal carrier).' },
    { label: 'Very Active', description: 'Spend a good part of the day doing heavy physical activity (e.g., bike messenger, carpenter).' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Level</Text>
      <Text style={styles.subtitle}>What is your baseline activity level?</Text>
      <Text style={styles.note}>Not including workouts - we count that separately.</Text>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.option,
            selectedOption === index && styles.selectedOption,
          ]}
          onPress={() => {
          setSelectedOption(index)
          setselected(true)
        }}
        >
          <Text style={[styles.optionLabel, selectedOption === index && styles.selecteddescription]}>{option.label}</Text>
          <Text style={[styles.optionDescription, selectedOption === index && styles.selecteddescription]}>{[option.description]}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={[styles.nextButton, !selected && styles.disabledButton]}
        onPress={()=>{
          updateRegistrationData('activityLevel', options[selectedOption].label);
          console.log(selectedOption);
          navigation.navigate('preference');
        }}
        disabled={!selected}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    marginTop: '8%',
  },
  title: {
    fontSize: 28, // Slightly bigger to make the title stand out
    fontWeight: 'bold',
    color: '#333',  // Darker color for readability
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: '#4A4A4A',  // Darker gray for a softer tone
    marginBottom: 8,
  },
  note: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#F7FAFC', // Lighter gray for better contrast
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',  // Subtle border to define boundaries
  },
  selectedOption: {
    backgroundColor: '#4A90E2',  // Blue background for selected state
    borderColor: '#357ABD', // Slightly darker border for selected state
  },
  optionLabel: {
    fontSize: 18,  // Increased size for better visibility
    fontWeight: '600',
    color: '#333', // Dark color for text
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280', // Slightly lighter gray for descriptions
    marginTop: 5,
  },
  selecteddescription:{
    color: 'white', // Slightly lighter gray for descriptions
  },
  nextButton: {
    backgroundColor: '#4A90E2',  // Prominent blue color
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    elevation: 4,  // Added shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  nextButtonText: {
    fontSize: 18,  // Slightly bigger to make it more clickable
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  disabledButton: {
    backgroundColor: '#E2E8F0',  // Gray for disabled state
  },
});


export default ActivityLevelScreen;
