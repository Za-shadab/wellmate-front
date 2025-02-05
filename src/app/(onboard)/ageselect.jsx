import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, TextInput, Pressable, ScrollView} from "react-native";
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'; 
import { Link} from "expo-router";
import { useNavigation } from "expo-router";
import {useRegistrationContext} from "../context/RegistrationContext";


  const GenderSelector = () =>{
    const [selectedOption, setSelectedOption] = useState(null);
    const navigation = useNavigation();
    const options = ["Male", "Female"];
    const [age, setage] = useState('');
    const [height, setheight] = useState('');
    const [weight, setweight] = useState('');
    const { registrationData, updateRegistrationData } = useRegistrationContext({});
    useEffect(()=>{
      console.log("Context Information....................................", registrationData);
    },[registrationData])


    return(
    <ScrollView
      style={styles.ScrollView}
    >
    <View style={styles.container}>
      <Text style={styles.title}>Tell us about yourself</Text>
      <Text style={styles.subtitle}>Your information helps us create a personalized experience for you.</Text>
      <Text style={styles.gtitle}>Choose you Gender:</Text>
      <View
        style={styles.radiocontainer}
      >
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.radioButtonContainer, selectedOption === option && styles.selectedButton]}
          onPress={() => {
            setSelectedOption(option)
            
          }}
        >
          <Text style={[styles.radioText, selectedOption === option && {color:'#fff'}]}>{option}</Text>
          <View style={styles.radioCircle}>
          {selectedOption === option && <FontAwesome6 name="check-circle" size={18} color="white" />}
          </View>
        </TouchableOpacity>
      ))}
      </View>
      <View style={styles.agecontainer}>
        <Text style={styles.subhead}>
          How Old are you?
        </Text>
        <TextInput
          placeholder="age"
          value={age}
          onChangeText={setage}
          style={styles.ageinput}
          keyboardType="numeric"
        />
        <Text style={styles.subhead}>
        What is your height? (cm)
        </Text>
        <TextInput
          placeholder="height"
          value={height}
          onChangeText={setheight}
          style={styles.ageinput}
          keyboardType="numeric"
        />
        <Text style={styles.subhead}>
        What is your weight? (kg)
        </Text>
        <TextInput
          placeholder="weight"
          value={weight}
          onChangeText={setweight}
          style={styles.ageinput}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={[styles.button,
        (!selectedOption || !age || !height || !weight) && styles.disabledButton,
      ]}
        onPress={()=>{
          updateRegistrationData('gender', selectedOption);
          updateRegistrationData('age', age);
          updateRegistrationData('height', height);
          updateRegistrationData('weight', weight);
          navigation.navigate('activitylevel')
        }}
        disabled={!selectedOption || !age || !height || !weight}
      >
          <Text style={styles.btntext}>Next</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
    )
  }


const AgeSelector = () => {
  return (
      <GenderSelector/>
  );
};

const styles = StyleSheet.create({
  ScrollView: {
    flex: 1,
    backgroundColor: "#F7F8FA", // Light background color for better contrast
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2C3E50", // Darker text color for better readability
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 20,
    textAlign: "center",
  },
  gtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#34495E",
  },
  radiocontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    height:'10%'
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BDC3C7",
    width: "45%",
    backgroundColor: "#ECF0F1",
  },
  selectedButton: { 
    borderColor: "#4A90E2",
    borderWidth:2,
    backgroundColor: "#4A90E2", // Highlighted background for selected option
  },
  radioText: {
    fontSize: 16,
    color: "#2C3E50",
    marginLeft: 5,
  },
  agecontainer: {
    marginTop: 20,
  },
  subhead: {
    fontSize: 16,
    color: "#34495E",
    marginTop: 20,
    marginBottom: 10,
  },
  ageinput: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    borderColor: "#BDC3C7",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 18,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 20,
  },
  btntext: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
  },
});
export default AgeSelector;
