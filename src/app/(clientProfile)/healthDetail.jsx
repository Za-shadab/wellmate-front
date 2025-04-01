import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Animated,
  SafeAreaView,
  StatusBar
} from "react-native";
import { useNavigation } from "expo-router";
import { useRegistrationContext } from "../context/RegistrationContext";
import { Picker } from "@react-native-picker/picker";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const HealthConditionsScreen = () => {
  const navigation = useNavigation();
  const { registrationData, updateRegistrationData } = useRegistrationContext();
  
  const [diabetesType, setDiabetesType] = useState("");
  const [diabetesMeds, setDiabetesMeds] = useState("");
  const [insulinUse, setInsulinUse] = useState("");
  const [pcosMeds, setPcosMeds] = useState("");
  const [thyroidType, setThyroidType] = useState("");
  const [thyroidMeds, setThyroidMeds] = useState("");
  const [tshLevels, setTshLevels] = useState("");

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateInputs = () => {
    if (registrationData.healthConditions.includes("Diabetes")) {
      if (!diabetesType) {
        Alert.alert("Error", "Please select the type of diabetes.");
        return false;
      }
      if (!diabetesMeds.trim()) {
        Alert.alert("Error", "Please enter your diabetes medications.");
        return false;
      }
    }
    if (registrationData.healthConditions.includes("Thyroid")) {
      if (!thyroidType.trim()) {
        Alert.alert("Error", "Please specify your thyroid condition.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateInputs()) return;

    updateRegistrationData("diabetesType", diabetesType);
    updateRegistrationData("diabetesMeds", diabetesMeds);
    updateRegistrationData("insulinUse", insulinUse);
    updateRegistrationData("pcosMeds", pcosMeds);
    updateRegistrationData("thyroidType", thyroidType);
    updateRegistrationData("thyroidMeds", thyroidMeds);
    updateRegistrationData("tshLevels", tshLevels);
    navigation.navigate("selectgoal");
  };

  const renderSection = (title, children) => (
    <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Health Details</Text>
          <Text style={styles.subtitle}>Please provide more information about your health conditions.</Text>
        </View>

        {registrationData.healthConditions.includes("Diabetes") && renderSection("Diabetes Information", (
          <>
            <Text style={styles.label}>Type of Diabetes:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={diabetesType}
                onValueChange={setDiabetesType}
                style={styles.picker}
              >
                <Picker.Item label="Select Type" value="" />
                <Picker.Item label="Type 1" value="Type 1" />
                <Picker.Item label="Type 2" value="Type 2" />
              </Picker>
            </View>

            <Text style={styles.label}>Diabetes Medications:</Text>
            <TextInput
              style={styles.input}
              value={diabetesMeds}
              onChangeText={setDiabetesMeds}
              placeholder="Enter medications"
              placeholderTextColor="#A0AEC0"
            />

            <Text style={styles.label}>Do you use insulin?</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={insulinUse}
                onValueChange={setInsulinUse}
                style={styles.picker}
              >
                <Picker.Item label="Select Option" value="" />
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
              </Picker>
            </View>
          </>
        ))}

        {registrationData.healthConditions.includes("PCOS") && renderSection("PCOS Information", (
          <>
            <Text style={styles.label}>PCOS Medications:</Text>
            <TextInput
              style={styles.input}
              value={pcosMeds}
              onChangeText={setPcosMeds}
              placeholder="Enter medications"
              placeholderTextColor="#A0AEC0"
            />
          </>
        ))}

        {registrationData.healthConditions.includes("Thyroid") && renderSection("Thyroid Information", (
          <>
            <Text style={styles.label}>Thyroid Condition:</Text>
            <TextInput
              style={styles.input}
              value={thyroidType}
              onChangeText={setThyroidType}
              placeholder="Hypo/Hyperthyroidism"
              placeholderTextColor="#A0AEC0"
            />

            <Text style={styles.label}>Thyroid Medications:</Text>
            <TextInput
              style={styles.input}
              value={thyroidMeds}
              onChangeText={setThyroidMeds}
              placeholder="Enter medications"
              placeholderTextColor="#A0AEC0"
            />

            <Text style={styles.label}>Recent TSH Levels (Optional):</Text>
            <TextInput
              style={styles.input}
              value={tshLevels}
              onChangeText={setTshLevels}
              placeholder="Enter TSH levels"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
            />
          </>
        ))}

        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Continue</Text>
          <FontAwesome6 name="arrow-right" size={16} color="#FFFFFF" style={styles.buttonIcon} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    width: "60%", // Adjust based on actual progress (3/5 = 60%)
    height: 6,
    backgroundColor: "#4A6DA7",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "500",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1A202C",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#718096",
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A5568",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    color: "#2D3748",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: "#4A6DA7",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    shadowColor: "#4A6DA7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default HealthConditionsScreen;