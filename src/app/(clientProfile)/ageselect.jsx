import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  ScrollView,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Feather, FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from "expo-router";
import { useRegistrationContext } from "../context/RegistrationContext";
import Animated, { FadeInRight } from "react-native-reanimated";

const AgeSelector = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigation = useNavigation();
  const options = ["Male", "Female"];
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const { registrationData, updateRegistrationData } = useRegistrationContext({});
  const [errors, setErrors] = useState({ age: '', height: '', weight: '' });

  useEffect(() => {
    console.log("Context Information....................................", registrationData);
  }, [registrationData]);

  useEffect(() => {
    setErrors({ age: '', height: '', weight: '' });
  }, [age, height, weight]);

  const validateFields = () => {
    let valid = true;
    let newErrors = { age: '', height: '', weight: '' };

    if (!age || isNaN(age) || age < 1 || age > 120) {
      newErrors.age = "Please enter a valid age (1-120).";
      valid = false;
    }
    if (!height || isNaN(height) || height < 50 || height > 300) {
      newErrors.height = "Please enter a valid height (50-300 cm).";
      valid = false;
    }
    if (!weight || isNaN(weight) || weight < 10 || weight > 500) {
      newErrors.weight = "Please enter a valid weight (10-500 kg).";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validateFields()) {
      updateRegistrationData('gender', selectedOption);
      updateRegistrationData('age', age);
      updateRegistrationData('height', height);
      updateRegistrationData('weight', weight);
      navigation.navigate('healthcondition');
    }
  };

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeInRight.duration(300)}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>Tell us about your client</Text>
                <Text style={styles.subtitle}>This information helps us create a personalized experience for you.</Text>
              </View>

              <View style={styles.formContainer}>
                <Text style={styles.sectionTitle}>Choose Gender:</Text>
                <View style={styles.radioContainer}>
                  {options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.radioButtonContainer,
                        selectedOption === option && styles.selectedButton
                      ]}
                      onPress={() => setSelectedOption(option)}
                    >
                      <Text style={[
                        styles.radioText,
                        selectedOption === option && styles.selectedRadioText
                      ]}>
                        {option}
                      </Text>
                      <View style={styles.radioCircle}>
                        {selectedOption === option && (
                          <FontAwesome6 name="check" size={14} color="black" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <InputField
                  label="How old are you?"
                  placeholder="Age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  error={errors.age}
                />

                <InputField
                  label="What is your height? (cm)"
                  placeholder="Height"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  error={errors.height}
                />

                <InputField
                  label="What is your weight? (kg)"
                  placeholder="Weight"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  error={errors.weight}
                />
              </View>
            </View>
          </ScrollView>

            </KeyboardAvoidingView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                (!selectedOption || !age || !height || !weight) && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={!selectedOption || !age || !height || !weight}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const InputField = ({ label, placeholder, value, onChangeText, keyboardType, error }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
      keyboardType={keyboardType}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A202C",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    marginRight: 12,
  },
  progressFilled: {
    width: "50%", // 3/6 of the progress
    height: "100%",
    backgroundColor: "#4A90E2",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "500",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 16,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    width: "48%",
    backgroundColor: "#F7FAFC",
  },
  selectedButton: {
    borderColor: "#4A90E2",
    backgroundColor: "#EBF8FF",
  },
  radioText: {
    fontSize: 16,
    color: "#4A5568",
    fontWeight: "500",
  },
  selectedRadioText: {
    color: "#2B6CB0",
    fontWeight: "600",
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CBD5E0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2D3748",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#F7FAFC",
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#A0AEC0",
    shadowOpacity: 0.1,
  },
  buttonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default AgeSelector;