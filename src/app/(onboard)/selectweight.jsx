import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Animated,
  Image
} from "react-native";
import { useRegistrationContext } from "../context/RegistrationContext";
import { useNavigation } from 'expo-router';
import Slider from '@react-native-community/slider';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const WeightChangeScreen = ({ navigation }) => {
  const [weeklyChange, setWeeklyChange] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [weeklyChangeError, setWeeklyChangeError] = useState("");
  const [goalWeightError, setGoalWeightError] = useState("");
  const [animatedValue] = useState(new Animated.Value(0));
  const { registrationData, updateRegistrationData } = useRegistrationContext({});
  const navigationone = useNavigation();

  // Calculate recommended weight range based on BMI
  const calculateRecommendedRange = () => {
    const heightM = registrationData.height / 100;
    const minWeight = (18.5 * heightM * heightM).toFixed(1);
    const maxWeight = (24.9 * heightM * heightM).toFixed(1);
    return { minWeight, maxWeight };
  };

  const { minWeight, maxWeight } = calculateRecommendedRange();

  // Determine if user wants to lose or gain weight
  const isWeightLoss = registrationData.goals?.includes("Lose Weight");
  const isWeightGain = registrationData.goals?.includes("Gain Weight");

  useEffect(() => {
    // Animate the card on mount
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Validate weekly change as user types
  const validateWeeklyChange = (value) => {
    setWeeklyChange(value);
    const numValue = parseFloat(value);
    
    if (value === "") {
      setWeeklyChangeError("");
      return false;
    } else if (isNaN(numValue)) {
      setWeeklyChangeError("Please enter a valid number");
      return true;
    } else if (numValue <= 0) {
      setWeeklyChangeError("Value must be greater than 0");
      return true;
    } else if (numValue > 2) {
      setWeeklyChangeError("For health reasons, limit to 2kg per week");
      return true;
    } else {
      setWeeklyChangeError("");
      return false;
    }
  };

  // Validate goal weight as user types
  const validateGoalWeight = (value) => {
    setGoalWeight(value);
    const numValue = parseFloat(value);
    const currentWeight = registrationData.weight;
    
    if (value === "") {
      setGoalWeightError("");
      return false;
    } else if (isNaN(numValue)) {
      setGoalWeightError("Please enter a valid number");
      return true;
    } else if (numValue <= 0) {
      setGoalWeightError("Value must be greater than 0");
      return true;
    } else if (isWeightLoss && numValue >= currentWeight) {
      setGoalWeightError("Goal weight should be less than current weight");
      return true;
    } else if (isWeightGain && numValue <= currentWeight) {
      setGoalWeightError("Goal weight should be more than current weight");
      return true;
    } else if (numValue < parseFloat(minWeight)) {
      setGoalWeightError(`Below healthy range (${minWeight}kg)`);
      return true;
    } else if (numValue > parseFloat(maxWeight)) {
      setGoalWeightError(`Above healthy range (${maxWeight}kg)`);
      return true;
    } else {
      setGoalWeightError("");
      return false;
    }
  };

  const validateAndContinue = () => {
    const weeklyChangeValue = parseFloat(weeklyChange);
    const goalWeightValue = parseFloat(goalWeight);
    const heightM = registrationData.height / 100;
    const minSafeWeight = 18.5 * (heightM * heightM);
    const maxSafeWeight = 30 * (heightM * heightM);

    // Validation checks
    if (isNaN(weeklyChangeValue) || weeklyChangeValue <= 0 || weeklyChangeValue > 2) {
      Alert.alert("Invalid Input", "Please enter a valid weight change between 0.1 and 2 kg per week.");
      return;
    }
    
    if (isNaN(goalWeightValue) || goalWeightValue <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid goal weight.");
      return;
    }
    
    if (goalWeightValue >= registrationData.weight && isWeightLoss) {
      Alert.alert("Goal Mismatch", "Your goal weight should be less than your current weight since you want to lose weight.");
      return;
    }
    
    if (goalWeightValue <= registrationData.weight && isWeightGain) {
      Alert.alert("Goal Mismatch", "Your goal weight should be more than your current weight since you want to gain weight.");
      return;
    }
    
    if (goalWeightValue < minSafeWeight) {
      Alert.alert("Unsafe Goal", `Your goal weight is too low. Minimum safe weight: ${minSafeWeight.toFixed(1)} kg.`);
      return;
    }
    
    if (goalWeightValue > maxSafeWeight) {
      Alert.alert("Unsafe Goal", `Your goal weight is too high. Maximum safe weight: ${maxSafeWeight.toFixed(1)} kg.`);
      return;
    }

    // All validations passed
    updateRegistrationData("Goalweight", goalWeightValue);
    updateRegistrationData("weightchangeRate", weeklyChangeValue);
    navigationone.navigate("activitylevel");
  };

  // Calculate time to reach goal
  const calculateTimeToGoal = () => {
    const weeklyChangeVal = parseFloat(weeklyChange) || 0;
    const goalWeightVal = parseFloat(goalWeight) || 0;
    const currentWeight = registrationData.weight || 0;
    
    if (weeklyChangeVal <= 0 || goalWeightVal <= 0) return "—";
    
    const weightDifference = Math.abs(goalWeightVal - currentWeight);
    const weeksToGoal = weightDifference / weeklyChangeVal;
    
    if (weeksToGoal < 1) return "Less than 1 week";
    if (weeksToGoal < 4) return `About ${Math.ceil(weeksToGoal)} weeks`;
    
    const months = Math.floor(weeksToGoal / 4);
    const remainingWeeks = Math.ceil(weeksToGoal % 4);
    
    if (remainingWeeks === 0) return `About ${months} month${months > 1 ? 's' : ''}`;
    return `About ${months} month${months > 1 ? 's' : ''} and ${remainingWeeks} week${remainingWeeks > 1 ? 's' : ''}`;
  };

  const cardOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const cardTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Set Your Weight Goal</Text>
        <Text style={styles.subtitle}>
          {isWeightLoss 
            ? "Let's set a healthy target for your weight loss journey" 
            : isWeightGain 
              ? "Let's set a healthy target for your weight gain journey"
              : "Let's set a healthy target for your fitness journey"}
        </Text>
      </View>

      <Animated.View 
        style={[
          styles.card, 
          { 
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslateY }]
          }
        ]}
      >
        <View style={styles.currentWeightContainer}>
          <Text style={styles.currentWeightLabel}>Current Weight</Text>
          <View style={styles.weightBadge}>
            <Text style={styles.currentWeightValue}>{registrationData.weight} kg</Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>
            Goal Weight (kg)
          </Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="weight-kilogram" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, goalWeightError ? styles.inputError : null]}
              keyboardType="numeric"
              placeholder="e.g. 70"
              placeholderTextColor="#999"
              value={goalWeight}
              onChangeText={validateGoalWeight}
            />
          </View>
          {goalWeightError ? (
            <Text style={styles.errorText}>{goalWeightError}</Text>
          ) : (
            <Text style={styles.helperText}>
              Healthy range: {minWeight} - {maxWeight} kg
            </Text>
          )}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>
            Weekly Change (kg/week)
          </Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="trending-up" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, weeklyChangeError ? styles.inputError : null]}
              keyboardType="numeric"
              placeholder="e.g. 0.5"
              placeholderTextColor="#999"
              value={weeklyChange}
              onChangeText={validateWeeklyChange}
            />
          </View>
          {weeklyChangeError ? (
            <Text style={styles.errorText}>{weeklyChangeError}</Text>
          ) : (
            <Text style={styles.helperText}>
              Recommended: 0.5-1 kg per week for sustainable results
            </Text>
          )}
        </View>

        {weeklyChange && goalWeight && !weeklyChangeError && !goalWeightError && (
          <View style={styles.estimateContainer}>
            <Text style={styles.estimateLabel}>Estimated Time to Goal:</Text>
            <Text style={styles.estimateValue}>{calculateTimeToGoal()}</Text>
          </View>
        )}
      </Animated.View>

      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#4A6EE0" />
        </View>
        <Text style={styles.infoText}>
          Health experts recommend a gradual approach to {isWeightLoss ? "weight loss" : "weight gain"}. 
          Aim for 0.5-1 kg per week for sustainable, healthy results.
        </Text>
      </View>

      <TouchableOpacity 
        style={[
          styles.button, 
          (!weeklyChange || !goalWeight || Boolean(weeklyChangeError) || Boolean(goalWeightError)) ? 
            styles.buttonDisabled : null
        ]} 
        onPress={validateAndContinue}
        disabled={!weeklyChange || !goalWeight || Boolean(weeklyChangeError) || Boolean(goalWeightError)}
      >
        <Text style={styles.buttonText}>Continue</Text>
        <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentWeightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  currentWeightLabel: {
    fontSize: 16,
    color: "#666",
  },
  weightBadge: {
    backgroundColor: '#F0F7FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  currentWeightValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6EE0',
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#D1D1D1",
    backgroundColor: "#FFF",
    borderRadius: 10,
    overflow: 'hidden',
  },
  inputIcon: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRightWidth: 1,
    borderRightColor: '#D1D1D1',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  inputError: {
    borderColor: "#FF5252",
  },
  errorText: {
    color: "#FF5252",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  estimateContainer: {
    backgroundColor: '#F0F7FF',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estimateLabel: {
    fontSize: 14,
    color: '#4A6EE0',
    fontWeight: '500',
  },
  estimateValue: {
    fontSize: 14,
    color: '#4A6EE0',
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#4A6EE0",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#4A6EE0",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: "#B0BEC5",
    shadowOpacity: 0,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginRight: 8,
  },
});

export default WeightChangeScreen;