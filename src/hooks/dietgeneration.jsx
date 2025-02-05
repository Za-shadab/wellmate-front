import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";

const DietGenerationPage = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [error, setError] = useState(null);

  // Replace this with your API endpoint
  const API_URL = "https://your-backend-api.com/generate-diet";

  const fetchDietPlan = async () => {
    setLoading(true);
    setError(null);

    try {
      // Replace `userId` with the actual user identifier from onboarding
      const userId = route.params?.userId || "default_user_id"; 
      const response = await fetch(`${API_URL}?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setDietPlan(data);
      } else {
        setError(data.message || "Failed to fetch diet plan.");
      }
    } catch (err) {
      setError("An error occurred while generating the diet plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Generate Your Diet Plan</Text>
      
      {loading && <ActivityIndicator size="large" color="#4CAF50" />}
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      {!loading && dietPlan && (
        <ScrollView style={styles.planContainer}>
          <Text style={styles.planHeader}>Your Diet Plan:</Text>
          {dietPlan.meals.map((meal, index) => (
            <View key={index} style={styles.mealItem}>
              <Text style={styles.mealTitle}>{meal.name}</Text>
              <Text style={styles.mealDetails}>
                Calories: {meal.calories} | Time: {meal.time}
              </Text>
              <Text style={styles.mealDescription}>{meal.description}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {!loading && !dietPlan && (
        <TouchableOpacity style={styles.button} onPress={fetchDietPlan}>
          <Text style={styles.buttonText}>Generate Diet Plan</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9F9F9",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  planContainer: {
    marginTop: 20,
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  planHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  mealItem: {
    marginBottom: 15,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  mealDetails: {
    fontSize: 14,
    color: "#777",
  },
  mealDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});

export default DietGenerationPage;
