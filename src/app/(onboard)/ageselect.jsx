import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  TextInput, 
  ScrollView, 
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from "react-native";
import { FontAwesome, FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from "expo-router";
import { useNavigation } from "expo-router";
import { useRegistrationContext } from "../context/RegistrationContext";

const { width, height } = Dimensions.get('window');

const GenderSelector = () => {
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Form state
  const [selectedOption, setSelectedOption] = useState(null);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState({
    age: '',
    height: '',
    weight: ''
  });
  const [activeInput, setActiveInput] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const navigation = useNavigation();
  const options = ["Male", "Female"];
  const { registrationData, updateRegistrationData } = useRegistrationContext({});
  
  useEffect(() => {
    // Animate elements when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
    
    // Add keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // Clean up listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    console.log("Context Information....................................", registrationData);
  }, [registrationData]);

  // Function to validate input format - allows only numbers and one decimal point
  const validateNumericInput = (value) => {
    // Regular expression to match numbers with an optional decimal point
    // This allows: "123", "123.45", ".45", but not "123.45.67" or "123,45" or "123a"
    const validNumericRegex = /^(\d*\.?\d*)$/;
    return validNumericRegex.test(value);
  };

  // Validation functions
  const validateAge = (value) => {
    // Check format first
    if (!validateNumericInput(value)) {
      return "Please enter only numbers (decimal allowed)";
    }
    
    const ageNum = parseFloat(value);
    if (isNaN(ageNum)) {
      return "Please enter a valid number";
    } else if (ageNum < 13) {
      return "You must be at least 13 years old";
    } else if (ageNum > 120) {
      return "Please enter a valid age";
    }
    return "";
  };

  const validateHeight = (value) => {
    // Check format first
    if (!validateNumericInput(value)) {
      return "Please enter only numbers (decimal allowed)";
    }
    
    const heightNum = parseFloat(value);
    if (isNaN(heightNum)) {
      return "Please enter a valid number";
    } else if (heightNum < 50) {
      return "Height seems too low";
    } else if (heightNum > 250) {
      return "Height seems too high";
    }
    return "";
  };

  const validateWeight = (value) => {
    // Check format first
    if (!validateNumericInput(value)) {
      return "Please enter only numbers (decimal allowed)";
    }
    
    const weightNum = parseFloat(value);
    if (isNaN(weightNum)) {
      return "Please enter a valid number";
    } else if (weightNum < 25) {
      return "Weight seems too low";
    } else if (weightNum > 250) {
      return "Weight seems too high";
    }
    return "";
  };

  // Handle input change with validation
  const handleAgeChange = (value) => {
    // Only update state if the input is valid or empty
    if (value === '' || validateNumericInput(value)) {
      setAge(value);
      setErrors(prev => ({ ...prev, age: validateAge(value) }));
    }
  };

  const handleHeightChange = (value) => {
    // Only update state if the input is valid or empty
    if (value === '' || validateNumericInput(value)) {
      setHeight(value);
      setErrors(prev => ({ ...prev, height: validateHeight(value) }));
    }
  };

  const handleWeightChange = (value) => {
    // Only update state if the input is valid or empty
    if (value === '' || validateNumericInput(value)) {
      setWeight(value);
      setErrors(prev => ({ ...prev, weight: validateWeight(value) }));
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      selectedOption &&
      age && 
      height && 
      weight && 
      !errors.age && 
      !errors.height && 
      !errors.weight
    );
  };

  // Calculate form completion percentage
  const calculateProgress = () => {
    let steps = 0;
    if (selectedOption) steps++;
    if (age && !errors.age) steps++;
    if (height && !errors.height) steps++;
    if (weight && !errors.weight) steps++;
    return (steps / 4) * 100;
  };

  // Handle form submission
  const handleSubmit = () => {
    // Dismiss keyboard if visible
    Keyboard.dismiss();
    
    // Final validation check
    const ageError = validateAge(age);
    const heightError = validateHeight(height);
    const weightError = validateWeight(weight);
    
    if (ageError || heightError || weightError) {
      setErrors({
        age: ageError,
        height: heightError,
        weight: weightError
      });
      return;
    }
    
    // Update context and navigate
    updateRegistrationData('gender', selectedOption);
    updateRegistrationData('age', age);
    updateRegistrationData('height', height);
    updateRegistrationData('weight', weight);
    navigation.navigate('selectgoal');
  };

  // Function to dismiss keyboard when tapping outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Use KeyboardAvoidingView only on iOS */}
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1 }}
          keyboardVerticalOffset={10}
        >
          <FormContent 
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            age={age}
            height={height}
            weight={weight}
            errors={errors}
            activeInput={activeInput}
            setActiveInput={setActiveInput}
            options={options}
            handleAgeChange={handleAgeChange}
            handleHeightChange={handleHeightChange}
            handleWeightChange={handleWeightChange}
            isFormValid={isFormValid}
            calculateProgress={calculateProgress}
            handleSubmit={handleSubmit}
            dismissKeyboard={dismissKeyboard}
          />
        </KeyboardAvoidingView>
      ) : (
        // On Android, use regular View
        <FormContent 
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          age={age}
          height={height}
          weight={weight}
          errors={errors}
          activeInput={activeInput}
          setActiveInput={setActiveInput}
          options={options}
          handleAgeChange={handleAgeChange}
          handleHeightChange={handleHeightChange}
          handleWeightChange={handleWeightChange}
          isFormValid={isFormValid}
          calculateProgress={calculateProgress}
          handleSubmit={handleSubmit}
          dismissKeyboard={dismissKeyboard}
        />
      )}
    </View>
  );
};

// Separate component for form content to avoid re-renders
const FormContent = ({
  fadeAnim,
  slideAnim,
  selectedOption,
  setSelectedOption,
  age,
  height,
  weight,
  errors,
  activeInput,
  setActiveInput,
  options,
  handleAgeChange,
  handleHeightChange,
  handleWeightChange,
  isFormValid,
  calculateProgress,
  handleSubmit,
  dismissKeyboard
}) => {
  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={dismissKeyboard}
    >
      {/* Progress bar */}
      {/* <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              { width: `${calculateProgress()}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(calculateProgress())}% completed</Text>
      </View> */}
      
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={dismissKeyboard}
        style={{ flex: 1 }}
      >
        <Animated.View 
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Tell us about yourself</Text>
            <Text style={styles.subtitle}>Your information helps us create a personalized experience for you.</Text>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Choose your Gender</Text>
            <View style={styles.radioContainer}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.radioButtonContainer, 
                    selectedOption === option && styles.selectedButton,
                    option === "Male" ? styles.maleButton : styles.femaleButton,
                    selectedOption === option && option === "Male" ? styles.selectedMaleButton : 
                    selectedOption === option && option === "Female" ? styles.selectedFemaleButton : null
                  ]}
                  onPress={() => setSelectedOption(option)}
                  activeOpacity={0.8}
                >
                  <View style={styles.radioIconContainer}>
                    {option === "Male" ? (
                      <Ionicons 
                        name="male" 
                        size={28} 
                        color={selectedOption === option ? "#FFFFFF" : "#3B82F6"} 
                      />
                    ) : (
                      <Ionicons 
                        name="female" 
                        size={28} 
                        color={selectedOption === option ? "#FFFFFF" : "#EC4899"} 
                      />
                    )}
                  </View>
                  <Text 
                    style={[
                      styles.radioText, 
                      selectedOption === option && styles.selectedRadioText
                    ]}
                  >
                    {option}
                  </Text>
                  <View style={[
                    styles.radioCircle,
                    selectedOption === option && styles.selectedRadioCircle
                  ]}>
                    {selectedOption === option && (
                      <FontAwesome6 name="check" size={12} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Your Measurements</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <MaterialCommunityIcons name="calendar-account" size={22} color="#3B82F6" />
                <Text style={styles.inputLabel}>Age (years)</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Enter your age"
                  value={age}
                  onChangeText={handleAgeChange}
                  onFocus={() => setActiveInput('age')}
                  onBlur={() => setActiveInput(null)}
                  style={[
                    styles.input, 
                    activeInput === 'age' && styles.inputActive,
                    errors.age ? styles.inputError : null
                  ]}
                  keyboardType="decimal-pad"
                  maxLength={5}
                  placeholderTextColor="#94A3B8"
                />
                {age ? (
                  <View style={styles.inputSuffix}>
                    <Text style={styles.inputSuffixText}>years</Text>
                  </View>
                ) : null}
              </View>
              {errors.age ? (
                <View style={styles.errorContainer}>
                  <FontAwesome name="exclamation-circle" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{errors.age}</Text>
                </View>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <MaterialCommunityIcons name="human-male-height" size={22} color="#3B82F6" />
                <Text style={styles.inputLabel}>Height (cm)</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Enter your height"
                  value={height}
                  onChangeText={handleHeightChange}
                  onFocus={() => setActiveInput('height')}
                  onBlur={() => setActiveInput(null)}
                  style={[
                    styles.input, 
                    activeInput === 'height' && styles.inputActive,
                    errors.height ? styles.inputError : null
                  ]}
                  keyboardType="decimal-pad"
                  maxLength={5}
                  placeholderTextColor="#94A3B8"
                />
                {height ? (
                  <View style={styles.inputSuffix}>
                    <Text style={styles.inputSuffixText}>cm</Text>
                  </View>
                ) : null}
              </View>
              {errors.height ? (
                <View style={styles.errorContainer}>
                  <FontAwesome name="exclamation-circle" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{errors.height}</Text>
                </View>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <MaterialCommunityIcons name="weight" size={22} color="#3B82F6" />
                <Text style={styles.inputLabel}>Weight (kg)</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Enter your weight"
                  value={weight}
                  onChangeText={handleWeightChange}
                  onFocus={() => setActiveInput('weight')}
                  onBlur={() => setActiveInput(null)}
                  style={[
                    styles.input, 
                    activeInput === 'weight' && styles.inputActive,
                    errors.weight ? styles.inputError : null
                  ]}
                  keyboardType="decimal-pad"
                  maxLength={5}
                  placeholderTextColor="#94A3B8"
                />
                {weight ? (
                  <View style={styles.inputSuffix}>
                    <Text style={styles.inputSuffixText}>kg</Text>
                  </View>
                ) : null}
              </View>
              {errors.weight ? (
                <View style={styles.errorContainer}>
                  <FontAwesome name="exclamation-circle" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{errors.weight}</Text>
                </View>
              ) : null}
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#3B82F6" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Your information is private and will only be used to provide personalized recommendations.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button, 
              !isFormValid() && styles.disabledButton,
              isFormValid() && styles.activeButton
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid()}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const AgeSelector = () => {
  return <GenderSelector />;
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: "#3B82F6",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 6,
    textAlign: 'right',
    fontWeight: '500',
  },
  container: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  headerContainer: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1E293B",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 18,
    color: "#1E293B",
    letterSpacing: 0.2,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    width: "48%",
    backgroundColor: "#F8FAFC",
  },
  maleButton: {
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
  femaleButton: {
    borderColor: "#FBCFE8",
    backgroundColor: "#FDF2F8",
  },
  selectedMaleButton: {
    borderColor: "#3B82F6",
    backgroundColor: "#3B82F6",
  },
  selectedFemaleButton: {
    borderColor: "#EC4899",
    backgroundColor: "#EC4899",
  },
  radioIconContainer: {
    marginRight: 8,
  },
  selectedButton: { 
    borderColor: "#3B82F6",
    backgroundColor: "#3B82F6",
  },
  radioText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    flex: 1,
    textAlign: 'center',
  },
  selectedRadioText: {
    color: "#FFFFFF",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  selectedRadioCircle: {
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginLeft: 10,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 58,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    color: "#1E293B",
    backgroundColor: "#FFFFFF",
    fontWeight: '500',
  },
  inputActive: {
    borderColor: "#3B82F6",
    borderWidth: 2,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  inputSuffix: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  inputSuffixText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoIcon: {
    marginRight: 14,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 22,
    fontWeight: '500',
  },
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  activeButton: {
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
  },
  buttonText: {
    fontSize: 17,
    color: "#FFFFFF",
    fontWeight: "700",
    marginRight: 10,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
});

export default AgeSelector;