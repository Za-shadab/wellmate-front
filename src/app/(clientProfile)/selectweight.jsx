import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image
} from "react-native";
import { useRegistrationContext } from "../context/RegistrationContext";
import { useNavigation } from 'expo-router';
import Animated, { FadeInRight } from "react-native-reanimated";

const WeightChangeScreen = ({ navigation }) => {
  const [weeklyChange, setWeeklyChange] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const { registrationData, updateRegistrationData } = useRegistrationContext({});
  const navigationone = useNavigation();

  const validateInput = () => {
    const weeklyChangeValue = parseFloat(weeklyChange);
    const goalWeightValue = parseFloat(goalWeight);

    const validateGoalWeight = (goalWeightValue, weight, heightCm) => {
      const heightM = heightCm / 100;
      const minSafeWeight = 18.5 * (heightM * heightM);
      const maxSafeWeight = 30 * (heightM * heightM);

      if (goalWeightValue < minSafeWeight) {
        Alert.alert("Unsafe Goal", `Your goal weight is too low. Minimum safe weight: ${minSafeWeight.toFixed(1)} kg.`);
        return false;
      }

      if (goalWeightValue > maxSafeWeight) {
        Alert.alert("Unsafe Goal", `Your goal weight is too high. Maximum safe weight: ${maxSafeWeight.toFixed(1)} kg.`);
        return false;
      }

      return true;
    };

    if (isNaN(weeklyChangeValue) || weeklyChangeValue <= 0 || weeklyChangeValue > 2) {
      Alert.alert("Invalid Input", "Please enter a valid weight change between 0.1 and 2 kg per week.");
      return;
    }
    if (isNaN(goalWeightValue) || goalWeightValue <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid goal weight.");
      return;
    }
    if (goalWeightValue >= registrationData.weight && registrationData.goals.includes("Lose Weight")) {
      Alert.alert("You selected to Lose Weight");
      return;
    }
    if (goalWeightValue <= registrationData.weight && registrationData.goals.includes("Gain Weight")) {
      Alert.alert("You selected to Gain Weight");
      return;
    }
    if (validateGoalWeight(goalWeightValue, registrationData.weight, registrationData.height)) {
      updateRegistrationData("Goalweight", goalWeightValue);
      updateRegistrationData("weightchangeRate", weeklyChangeValue);
      navigationone.navigate("activitylevel");
    }
  };

  const isLoseWeight = registrationData.goals?.includes("Lose Weight");
  const isGainWeight = registrationData.goals?.includes("Gain Weight");
  const goalType = isLoseWeight ? "lose" : isGainWeight ? "gain" : "change";

  return (
    <Animated.View 
      style={styles.outerContainer}
      entering={FadeInRight.duration(300)}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>Set Weight Goal</Text>
                <Text style={styles.subtitle}>
                  Let's set a realistic target for your {goalType} client's weight journey
                </Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Weekly weight {goalType} (kg)</Text>
                  <Text style={styles.helperText}>Recommended: 0.5-1 kg per week</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="e.g. 0.5"
                      placeholderTextColor="#A0AEC0"
                      value={weeklyChange}
                      onChangeText={setWeeklyChange}
                    />
                    <View style={styles.inputIcon}>
                      <Text style={styles.inputIconText}>kg/week</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Target weight</Text>
                  {registrationData.weight && (
                    <Text style={styles.helperText}>
                      Current: {registrationData.weight} kg
                    </Text>
                  )}
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="e.g. 70"
                      placeholderTextColor="#A0AEC0"
                      value={goalWeight}
                      onChangeText={setGoalWeight}
                    />
                    <View style={styles.inputIcon}>
                      <Text style={styles.inputIconText}>kg</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <Text style={styles.infoIcon}>ℹ️</Text>
                  </View>
                  <Text style={styles.infoText}>
                    A healthy weight loss/gain is typically 0.5-1 kg per week. Setting realistic goals increases your chances of success.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.button,
                (!weeklyChange || !goalWeight) && styles.buttonDisabled
              ]} 
              onPress={validateInput}
              disabled={!weeklyChange || !goalWeight}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    margin: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A202C",
    textAlign: "center",
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    marginRight: 12,
  },
  progressFilled: {
    width: "33.3%", // 2/6 of the progress
    height: "100%",
    backgroundColor: "#4A90E2",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    lineHeight: 22,
  },
  formContainer: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 6,
  },
  helperText: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F7FAFC",
    overflow: "hidden",
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#2D3748",
  },
  inputIcon: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#EDF2F7",
    borderLeftWidth: 1,
    borderLeftColor: "#E2E8F0",
  },
  inputIconText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#718096",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EBF8FF",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  infoIconContainer: {
    marginRight: 12,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#2C5282",
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#A0AEC0",
    shadowOpacity: 0.1,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});

export default WeightChangeScreen;