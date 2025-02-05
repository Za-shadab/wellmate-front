import React, { useState, useEffect } from "react";
import {View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Pressable} from "react-native";
import { Link, router} from "expo-router";

import axios from "axios";

const MealPlanPage = () => {
  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = "http://192.168.3.17:3000/recipeapi/recipe"; // Replace with your backend URL

  useEffect(() => {
    fetchMealPlan();
  }, []);

  const fetchMealPlan = async () => {
    try {
      const response = await axios.get(API_URL);
      if (response.status === 200) {
        setMealPlan(response.data);
      } else {
        setError("Failed to load meal plan.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching the meal plan.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading meal plan...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchMealPlan} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meal Plan</Text>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>Today, {new Date().toDateString()}</Text>
      </View>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {mealPlan.calories} Calories
        </Text>
        <Text style={styles.summaryDetails}>
          {/* {mealPlan.macros.carbs}g Carbs, {mealPlan.recipe.fat}g Fat, {mealPlan.macros.protein}g Protein */}
        </Text>
      </View>
      <ScrollView style={styles.scrollView}>
        {mealPlan.meals.map((meal, index) => (
          <View key={index} style={styles.mealSection}>
            <Text style={styles.mealTitle}>{meal.mealType}</Text>
            <Text style={styles.mealCalories}>{meal.recipe.calories} Calories</Text>


            {/* <Link href= {`/mealplan/${meal.recipe}`} asChild> */}
              <Pressable onPress={()=>{router.push({
                pathname: "/mealplan/[mealDetail]",
                params:{mealDetail: JSON.stringify(meal)}
              })}}>
                <View style={styles.mealItem}>
                <Image source={{ uri: meal.recipe.image }} style={styles.mealImage} />
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.recipe.label}</Text>
                  <Text style={styles.mealDetails}>
                    {meal.recipe.serving} • {meal.recipe.calories} Calories
                  </Text>
                </View>
                </View>
              </Pressable>
            {/* </Link> */}

          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
    color: "#333",
  },
  dateContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#555",
  },
  summaryContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  summaryText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  summaryDetails: {
    fontSize: 14,
    color: "#777",
  },
  scrollView: {
    marginTop: 10,
  },
  mealSection: {
    marginBottom: 20,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
    color: "#333",
  },
  mealCalories: {
    fontSize: 14,
    color: "#555",
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  mealImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  mealDetails: {
    fontSize: 14,
    color: "#777",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default MealPlanPage;
