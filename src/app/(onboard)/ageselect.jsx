import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, TextInput, Pressable} from "react-native";
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'; 
import { Link} from "expo-router";
import {useRegistrationContext} from "../context/RegistrationContext";


  const GenderSelector = () =>{
    const [selectedOption, setSelectedOption] = useState(null);
    const options = ["Male", "Female"];
    const [age, setage] = useState('');
    const { registrationData, updateRegistrationData } = useRegistrationContext({});
    useEffect(()=>{
      console.log("Context Information....................................", registrationData);
    },[registrationData])


    return(
    <View style={styles.container}>
      <Text style={styles.title}>Tell us about yourself</Text>
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
          <Text style={styles.radioText}>{option}</Text>
          <View style={styles.radioCircle}>
          {selectedOption === option && <FontAwesome6 name="check-circle" size={18} color="black" />}
          </View>
        </TouchableOpacity>
      ))}
      </View>
      <View style={styles.agecontainer}>
        <Text>
          How Old are you?
        </Text>
        <TextInput
          placeholder="age"
          value={age}
          onChangeText={setage}
          style={styles.ageinput}
          keyboardType="numeric"
        />
      </View>

      <Link href={'activitylevel'} asChild>
      <Pressable style={styles.button}
        onPress={()=>{
          updateRegistrationData('gender', selectedOption);
          updateRegistrationData('age', age)
        }}
      >
          <Text style={styles.btntext}>Next</Text>
      </Pressable>
      </Link>
    </View>
    )
  }


const AgeSelector = () => {
  return (
      <GenderSelector/>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize:18,
    marginBottom: 20,
    fontWeight:'600'
  },
  gtitle:{
    marginBottom:20
  },
  selectedButton: {
    borderWidth:2,
    borderColor:'#4B4376' // Highlighted background for selected option
  },
  radiocontainer:{
    height:'7%',
    // paddingHorizontal:'4%',
    flexDirection:'row',
    justifyContent:'space-between',
    marginBottom:20
  },
  innercontainer:{
    flex:1,
    height:'10%',
    width:'100%',
    borderRadius:9,
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:'space-evenly',
    height:'100%',
    width:'40%',
    borderRadius:9,
    borderWidth:1
  },
  selectedCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
  },
  radioText: {
    fontSize: 16,
    color:'#494F55'
  },
  selectedText: {
    fontSize: 16,
    fontStyle: "italic",
  },
  agecontainer:{
    flex:1,
  },
  ageinput:{
    height:45,
    width:'100%',
    borderWidth:1,
    borderRadius:9,
    marginTop:20
  },
  button:{
    height:45,
    width:'100%',
    // backgroundColor:'#FF5722',
    backgroundColor:'black',
    borderRadius:20,
    justifyContent:'center',
    alignSelf:'center'
  },
  btntext:{
    fontSize:22,
    color:'white',
    textAlign:'center',
  }
});

export default AgeSelector;
