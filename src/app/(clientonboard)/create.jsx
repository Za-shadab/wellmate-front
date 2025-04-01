import { useState } from "react";
import { View, Text, TextInput, Switch, TouchableOpacity, Alert, StyleSheet, ScrollView, ImageBackground } from "react-native";
import { useNavigation } from "expo-router";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useClientRegistrationContext } from "../context/ClientRegistration";
import {useNutritionistDetailContext} from '../context/NutritionistContext';
import axios from 'axios'
import { URL } from "../../constants/url";

const CustomInput = ({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType }) => (
  <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#A0AEC0"
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
    />
  </Animated.View>
);

const CustomSwitch = ({ value, onValueChange, label }) => (
  <View style={styles.switchContainer}>
    <Text style={styles.switchLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#CBD5E0", true: "#4FD1C5" }}
      thumbColor={value ? "#2C7A7B" : "#F7FAFC"}
    />
  </View>
);

const CreateClientScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const navigation = useNavigation();
  const {ClientregistrationData, updateClientRegistrationData} = useClientRegistrationContext({});
  const {nutritionistDetail, updateNutritionistDetail} = useNutritionistDetailContext({});
  const role = 'client_user'
  const createdBy = nutritionistDetail.nutritionistId
  console.log('createdBy', createdBy)

  const handleCreateClient = async () => {
    if (!name || !email || !password || !location) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    try {
      updateClientRegistrationData('name', name)
      updateClientRegistrationData('email', email)
      updateClientRegistrationData('password', password)
      updateClientRegistrationData('location', location)
      updateClientRegistrationData('role', role)
      updateClientRegistrationData('createdBy', createdBy)
      const clientData = { name, email, password, location, role, createdBy, sendEmail};
  
      console.log("Client Created:", clientData);
      const response = await axios.post(`${URL}/api/register`, clientData);
      console.log(response);
      Alert.alert("Success", "Client account has been created successfully.");
      navigation.navigate("(nutritionist)");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="white" style={styles.heroBackButton} />
        </TouchableOpacity>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.card}>
          <Text style={styles.title}>Create Client Credentials</Text>
          <Text style={styles.subtitle}>
            Enter the required details for the client. You can also choose to send these credentials via email.
          </Text>
          <CustomInput label="Name" value={name} onChangeText={setName} placeholder="Enter name" />
          <CustomInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            keyboardType="email-address"
          />
          <CustomInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />
          <CustomInput label="Location" value={location} onChangeText={setLocation} placeholder="Enter location" />
          <CustomSwitch value={sendEmail} onValueChange={setSendEmail} label="Send credentials via email" />
          <TouchableOpacity style={styles.button} onPress={handleCreateClient}>
            <Text style={styles.buttonText}>Create Client</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  heroBackButton: {
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 10,
    borderRadius: 50,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#2D3748",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: "#4A5568",
  },
  button: {
    backgroundColor: "#4FD1C5",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 10,
  },
});

export default CreateClientScreen;