"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Keyboard,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { router, useNavigation } from "expo-router"
import { Ionicons, Feather } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Picker } from "@react-native-picker/picker"
import { useNutriRegistrationContext } from "../context/NutriRegistration" // Import the context hook

// List of specializations for the dropdown
const SPECIALIZATIONS = [
  "Clinical Nutrition",
  "Sports Nutrition",
  "Pediatric Nutrition",
  "Weight Management",
  "Diabetes Management",
  "Eating Disorders",
  "Digestive Health",
  "Heart Health",
  "Oncology Nutrition",
  "Renal Nutrition",
  "Vegan/Vegetarian Nutrition",
  "Prenatal Nutrition",
  "Geriatric Nutrition",
  "Food Allergies & Intolerances",
  "Other",
]

// List of common certifications for suggestions
const CERTIFICATION_SUGGESTIONS = [
  "Registered Dietitian (RD)",
  "Certified Nutrition Specialist (CNS)",
  "Certified Clinical Nutritionist (CCN)",
  "Board Certified in Holistic Nutrition",
  "Certified Sports Nutritionist",
  "Certified Diabetes Educator (CDE)",
  "Certified LEAP Therapist (CLT)",
  "Certified Nutrition Coach",
  "Master of Science in Nutrition",
  "PhD in Nutritional Sciences",
]

const NutritionistCredentialsScreen = () => {
  // Access the context
  const { nutriregistrationData, updateNutriRegistrationData } = useNutriRegistrationContext()
  
  // Form state - initialize from context if available
  const [specialization, setSpecialization] = useState(nutriregistrationData.specialization || "")
  const [otherSpecialization, setOtherSpecialization] = useState("")
  const [yearsExperience, setYearsExperience] = useState(nutriregistrationData.experience || "")
  const [certifications, setCertifications] = useState(
    nutriregistrationData.certifications 
      ? JSON.parse(nutriregistrationData.certifications) 
      : [{ id: 1, value: "", isValid: true }]
  )
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeCertificationId, setActiveCertificationId] = useState(null)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const navigation = useNavigation()

  // Validation state
  const [errors, setErrors] = useState({
    specialization: "",
    yearsExperience: "",
    certifications: "",
  })

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showSpecializationPicker, setShowSpecializationPicker] = useState(false)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const shakeAnim = useRef(new Animated.Value(0)).current
  const progressAnim = useRef(new Animated.Value(0)).current

  // Refs
  const scrollViewRef = useRef(null)

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()

    // Update progress
    updateProgress()

    // Load saved data if not already in context
    if (!nutriregistrationData.specialization && !nutriregistrationData.experience) {
      loadSavedData()
    }
  }, [])

  useEffect(() => {
    // Update progress whenever form values change
    updateProgress()
  }, [specialization, yearsExperience, certifications])

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [progress])

  const loadSavedData = async () => {
    try {
      const savedData = await AsyncStorage.getItem("nutritionistCredentials")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setSpecialization(parsedData.specialization || "")
        setOtherSpecialization(parsedData.otherSpecialization || "")
        setYearsExperience(parsedData.yearsExperience || "")
        setCertifications(parsedData.certifications || [{ id: 1, value: "", isValid: true }])
      }
    } catch (error) {
      console.error("Error loading saved data:", error)
    }
  }

  const updateProgress = () => {
    let completed = 0
    const total = 3 // Specialization, experience, and at least one certification

    if (specialization) completed++
    if (yearsExperience) completed++
    if (certifications.some((cert) => cert.value.trim() !== "")) completed++

    setProgress(completed / total)
  }

  const handleSpecializationChange = (value) => {
    setSpecialization(value)
    setErrors((prev) => ({ ...prev, specialization: "" }))

    if (value === "Other") {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 300)
    }
  }

  const handleExperienceChange = (value) => {
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      setYearsExperience(value)
      setErrors((prev) => ({ ...prev, yearsExperience: "" }))
    }
  }

  const handleCertificationChange = (id, value) => {
    setCertifications((prevCerts) =>
      prevCerts.map((cert) => (cert.id === id ? { ...cert, value, isValid: true } : cert)),
    )
    setErrors((prev) => ({ ...prev, certifications: "" }))

    // Filter suggestions based on input
    if (value.trim()) {
      const filtered = CERTIFICATION_SUGGESTIONS.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase()),
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
      setActiveCertificationId(id)
    } else {
      setShowSuggestions(false)
    }
  }

  const addCertification = () => {
    // Provide haptic feedback
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    const newId = certifications.length > 0 ? Math.max(...certifications.map((c) => c.id)) + 1 : 1

    setCertifications([...certifications, { id: newId, value: "", isValid: true }])

    // Scroll to the new input after a short delay
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  const removeCertification = (id) => {
    // Provide haptic feedback
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }

    if (certifications.length > 1) {
      setCertifications(certifications.filter((cert) => cert.id !== id))
    } else {
      // If it's the last one, just clear it
      setCertifications([{ id: 1, value: "", isValid: true }])
    }
  }

  const selectSuggestion = (suggestion) => {
    setCertifications((prevCerts) =>
      prevCerts.map((cert) =>
        cert.id === activeCertificationId ? { ...cert, value: suggestion, isValid: true } : cert,
      ),
    )
    setShowSuggestions(false)

    // Provide haptic feedback
    if (Platform.OS === "ios") {
      Haptics.selectionAsync()
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = { specialization: "", yearsExperience: "", certifications: "" }

    // Validate specialization
    if (!specialization) {
      newErrors.specialization = "Please select your specialization"
      isValid = false
    } else if (specialization === "Other" && !otherSpecialization.trim()) {
      newErrors.specialization = "Please specify your specialization"
      isValid = false
    }

    // Validate years of experience
    if (!yearsExperience) {
      newErrors.yearsExperience = "Please enter your years of experience"
      isValid = false
    } else if (Number.parseInt(yearsExperience) > 70) {
      newErrors.yearsExperience = "Please enter a valid number of years"
      isValid = false
    }

    // Validate certifications
    const validCertifications = certifications.filter((cert) => cert.value.trim() !== "")
    if (validCertifications.length === 0) {
      newErrors.certifications = "Please add at least one certification"
      isValid = false

      // Mark all empty certifications as invalid
      setCertifications((prevCerts) =>
        prevCerts.map((cert) => (cert.value.trim() === "" ? { ...cert, isValid: false } : cert)),
      )
    }

    setErrors(newErrors)

    if (!isValid) {
      // Shake animation for error feedback
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start()

      // Haptic feedback for error
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
    }

    return isValid
  }

  const handleSubmit = async () => {
    Keyboard.dismiss()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare data for saving
      const finalSpecialization = specialization === "Other" ? otherSpecialization : specialization
      const validCertifications = certifications.filter((cert) => cert.value.trim() !== "")
      
      // Update context with the form data
      updateNutriRegistrationData("specialization", finalSpecialization)
      updateNutriRegistrationData("experience", yearsExperience)
      updateNutriRegistrationData("certifications", JSON.stringify(validCertifications))
      
      // Also save to AsyncStorage for persistence
      const credentialsData = {
        specialization: finalSpecialization,
        otherSpecialization: specialization === "Other" ? otherSpecialization : "",
        yearsExperience,
        certifications: validCertifications,
      }
      
      await AsyncStorage.setItem("nutritionistCredentials", JSON.stringify(credentialsData))

      // Success haptic feedback
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }

      // Navigate to next screen after a short delay to show the loading state
      setTimeout(() => {
        setIsSubmitting(false)
        navigation.navigate('branding')
      }, 800)
    } catch (error) {
      console.error("Error saving credentials:", error)
      setIsSubmitting(false)
      Alert.alert("Error", "Failed to save your credentials. Please try again.")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Professional Credentials</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
              },
            ]}
          >
            <Text style={styles.formTitle}>Tell us about your expertise</Text>
            <Text style={styles.formSubtitle}>
              This information helps clients find the right nutritionist for their needs
            </Text>

            {/* Specialization Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Specialization</Text>
              <TouchableOpacity
                style={[styles.selectField, errors.specialization ? styles.inputError : null]}
                onPress={() => setShowSpecializationPicker(true)}
              >
                <Text style={specialization ? styles.selectText : styles.selectPlaceholder}>
                  {specialization || "Select your specialization"}
                </Text>
                <Feather name="chevron-down" size={20} color="#777" />
              </TouchableOpacity>
              {errors.specialization ? <Text style={styles.errorText}>{errors.specialization}</Text> : null}

              {/* Other Specialization Input */}
              {specialization === "Other" && (
                <View style={styles.otherSpecializationContainer}>
                  <TextInput
                    style={[styles.input, errors.specialization ? styles.inputError : null]}
                    placeholder="Please specify your specialization"
                    value={otherSpecialization}
                    onChangeText={(text) => {
                      setOtherSpecialization(text)
                      if (text.trim()) {
                        setErrors((prev) => ({ ...prev, specialization: "" }))
                      }
                    }}
                  />
                </View>
              )}
            </View>

            {/* Years of Experience Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Years of Experience</Text>
              <TextInput
                style={[styles.input, errors.yearsExperience ? styles.inputError : null]}
                placeholder="Enter years of experience"
                value={yearsExperience}
                onChangeText={handleExperienceChange}
                keyboardType="number-pad"
                maxLength={2}
              />
              {errors.yearsExperience ? <Text style={styles.errorText}>{errors.yearsExperience}</Text> : null}
            </View>

            {/* Certifications Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>Certifications & Credentials</Text>
                <TouchableOpacity style={styles.addButton} onPress={addCertification}>
                  <Feather name="plus" size={18} color="#4CAF50" />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              {errors.certifications ? <Text style={styles.errorText}>{errors.certifications}</Text> : null}

              {certifications.map((cert, index) => (
                <View key={cert.id} style={styles.certificationContainer}>
                  <TextInput
                    style={[styles.input, styles.certificationInput, !cert.isValid ? styles.inputError : null]}
                    placeholder={`Certification ${index + 1}`}
                    value={cert.value}
                    onChangeText={(text) => handleCertificationChange(cert.id, text)}
                    onFocus={() => {
                      setActiveCertificationId(cert.id)
                      if (cert.value.trim()) {
                        handleCertificationChange(cert.id, cert.value)
                      }
                    }}
                    onBlur={() => {
                      // Hide suggestions after a delay
                      setTimeout(() => {
                        setShowSuggestions(false)
                      }, 200)
                    }}
                  />
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeCertification(cert.id)}>
                    <Feather name="x" size={20} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Certification Suggestions */}
              {showSuggestions && activeCertificationId && (
                <View style={styles.suggestionsContainer}>
                  {filteredSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => selectSuggestion(suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.helperText}>Add all relevant certifications and credentials</Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting ? styles.submitButtonDisabled : null]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Save & Continue</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Specialization Picker Modal */}
        {showSpecializationPicker && (
          <View style={styles.pickerModalContainer}>
            <TouchableOpacity style={styles.pickerBackdrop} onPress={() => setShowSpecializationPicker(false)} />
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Specialization</Text>
                <TouchableOpacity onPress={() => setShowSpecializationPicker(false)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <Picker selectedValue={specialization} onValueChange={handleSpecializationChange} style={styles.picker}>
                <Picker.Item label="Select your specialization" value="" color="#999" />
                {SPECIALIZATIONS.map((spec, index) => (
                  <Picker.Item key={index} label={spec} value={spec} />
                ))}
              </Picker>
              <TouchableOpacity style={styles.pickerDoneButton} onPress={() => setShowSpecializationPicker(false)}>
                <Text style={styles.pickerDoneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    // marginTop:20
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 34,
  },
  progressContainer: {
    height: 6,
    backgroundColor: "#e0e0e0",
    width: "100%",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333333",
  },
  inputError: {
    borderColor: "#FF5252",
  },
  selectField: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: {
    fontSize: 16,
    color: "#333333",
  },
  selectPlaceholder: {
    fontSize: 16,
    color: "#999999",
  },
  otherSpecializationContainer: {
    marginTop: 12,
  },
  errorText: {
    color: "#FF5252",
    fontSize: 14,
    marginTop: 6,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  addButtonText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  certificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  certificationInput: {
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    padding: 8,
  },
  helperText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 8,
  },
  suggestionsContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 8,
    marginTop: -10,
    marginBottom: 12,
    maxHeight: 150,
    overflow: "hidden",
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333333",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  pickerModalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pickerContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  picker: {
    width: "100%",
    height: 200,
  },
  pickerDoneButton: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
  },
  pickerDoneButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default NutritionistCredentialsScreen