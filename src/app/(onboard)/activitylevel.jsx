import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet,Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useRegistrationContext } from '../context/RegistrationContext';

const ActivityLevelScreen = () => {
  const [selectedOption, setSelectedOption] = useState(null);
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
          onPress={() => setSelectedOption(index)}
        >
          <Text style={styles.optionLabel}>{option.label}</Text>
          <Text style={styles.optionDescription}>{option.description}</Text>
        </TouchableOpacity>
      ))}
    <Link href={'preference'} asChild>
      <Pressable style={styles.nextButton}
        onPress={()=>{
          updateRegistrationData('activityLevel', options[selectedOption].label);
        }}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </Pressable>
    </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#1c1c1e',
    backgroundColor:'#fff',
    padding: 20,
    marginTop:'8%'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    // color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    // color: '#ffffff',
    marginBottom: 5,
  },
  note: {
    fontSize: 14,
    color: '#a1a1a1',
    marginBottom: 20,
  },
  option: {
    // backgroundColor: '#2c2c2e',
    backgroundColor:'#ededed',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedOption: {
    // borderColor: '#0a84ff',
    borderColor:'black',
    borderWidth: 2,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    // color: '#ffffff',
  },
  optionDescription: {
    fontSize: 14,
    color: '#a1a1a1',
  },
  nextButton: {
    // backgroundColor: '#0a84ff',
    backgroundColor:'black',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default ActivityLevelScreen;
