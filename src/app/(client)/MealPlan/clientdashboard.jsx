import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useClientUserContext } from "../../context/ClientUserContext";
import axios from "axios";
import { URL } from "../../../constants/url";
import { useRouter } from "expo-router";
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

const { width } = Dimensions.get("window");

const getNutrientValue = (nutrients, index, defaultValue = 0) => {
  if (!nutrients || !Array.isArray(nutrients) || !nutrients[index]) return defaultValue;
  return Math.round(nutrients[index].value || defaultValue);
};

const ClientMealPlanScreen = () => {
  const { clientUser } = useClientUserContext();
  const [permissions, setPermissions] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [loadingMealPlan, setLoadingMealPlan] = useState(true);
  const [clientProfile, setClientProfile] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const router = useRouter();

  // Fetch client permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await axios.get(`${URL}/api/clientdata/${clientUser.clientId}`);
        setPermissions(response.data.client.permissions);
      } catch (error) {
        console.error("Error fetching client permissions:", error.response?.data || error.message);
        Alert.alert("Error", "Failed to fetch client permissions. Please try again.");
      } finally {
        setLoadingPermissions(false);
      }
    };

    if (clientUser.clientId) {
      fetchPermissions();
    }
  }, [clientUser.clientId]);

  // Fetch meal plan
  const fetchMealPlan = async () => {
    try {
      const response = await axios.get(`${URL}/api/mealplan/${clientUser.clientId}`);
      setMealPlan(response.data.mealPlan);
    } catch (error) {
      console.error("Error fetching meal plan:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to fetch meal plan. Please try again.");
    } finally {
      setLoadingMealPlan(false);
    }
  };

  // Fetch meal plan when component mounts
  useEffect(() => {
    if (clientUser.clientId) {
      fetchMealPlan();
    }
  }, [clientUser.clientId]);

  // Refetch meal plan when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchMealPlan();
      return () => {
        setMealPlan(null);
      };
    }, [clientUser.clientId])
  );

  // Fetch client profile
  const fetchClientProfile = async () => {
    try {
      const response = await axios.get(`${URL}/api/clientdata/${clientUser.clientId}`);
      setClientProfile(response.data.client);
    } catch (error) {
      console.error("Error fetching client profile:", error);
    }
  };

  useEffect(() => {
    if (clientUser.clientId) {
      fetchClientProfile();
    }
  }, [clientUser.clientId]);

  // Handle meal logging
  const logMeal = (meal) => {
    if (!permissions?.allowFoodLogging) {
      Alert.alert("Permission Denied", "You do not have permission to log meals.");
      return;
    }
    Alert.alert("Meal Logged", `You have logged the meal: ${meal.recipe.label}`);
  };

  const handleLog = async (meal) => {
    if (!meal || !meal.recipe) {
      console.error("Error: Invalid meal data");
      return;
    }
  
    // if (!permissions?.allowFoodLogging) {
    //   Alert.alert("Permission Denied", "You do not have permission to log meals.");
    //   return;
    // }
  
    try {
      const recipe = meal.recipe;
      const nutrients = recipe.nutrients || [];
  
      const foodLogEntry = {
        clientUserId: clientUser.clientId,
        foodId: recipe.uri ? recipe.uri.split("#recipe_")[1] : `manual-entry-${Date.now()}`,
        foodName: recipe.label || "Meal from plan",
        image: recipe.image || "",
        measure: "serving",
        quantity: 1,
        mealType: meal.mealType || "meal",
        calories: `${getNutrientValue(nutrients, 0)}Kcal`,
        protein: `${getNutrientValue(nutrients, 10)}g`,
        fats: `${getNutrientValue(nutrients, 1)}g`,
        fiber: `${getNutrientValue(nutrients, 8)}g`,
        carbs: `${getNutrientValue(nutrients, 6)}g`,
        sugar: `${getNutrientValue(nutrients, 9)}g`,
        cholestrol: `${getNutrientValue(nutrients, 11)}mg`,
        iron: `${getNutrientValue(nutrients, 15)}mg`,
        magnesium: `${getNutrientValue(nutrients, 13)}mg`,
        potassium: `${getNutrientValue(nutrients, 14)}mg`,
        sodium: `${getNutrientValue(nutrients, 12)}mg`,
        zinc: `${getNutrientValue(nutrients, 16)}mg`,
        vitaminB12: `${getNutrientValue(nutrients, 27)}mg`,
        VitaminB6: `${getNutrientValue(nutrients, 23)}mg`,
        VitaminC: `${getNutrientValue(nutrients, 19)}mg`,
        VitaminD: `${getNutrientValue(nutrients, 28)}mg`,
        thiamin: `${getNutrientValue(nutrients, 20)}mg`,
      };
  
      // Correct API endpoint
      const response = await axios.post(`${URL}/foodlog/add`, foodLogEntry);
      
      // Check if the request was successful
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "Meal logged successfully!");
        // Refresh the meal plan to show updated status
        fetchMealPlan();
      } else {
        throw new Error("Failed to log meal");
      }
    } catch (error) {
      console.error("Error logging meal:", error.response?.data || error.message);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Failed to log meal. Please try again."
      );
    }
  };

  // Handle selecting alternatives
  const selectAlternative = (meal) => {
    if (!permissions?.regenerateMeals) {
      Alert.alert("Permission Denied", "You do not have permission to select alternatives.");
      return;
    }
    router.push({
      pathname: "/(client)/MealPlan/[alternateRecipes]",
      params: { mealId: meal.recipe.id, clientId: clientUser.clientId },
    });
  };

  // Get meal type based on index
  const getMealType = (index) => {
    const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];
    return mealTypes[index % mealTypes.length];
  };

  // Get placeholder image for meal
  const getMealImage = (mealType) => {
    switch (mealType.toLowerCase()) {
      case "breakfast":
        return "https://images.unsplash.com/photo-1533089860892-a9b9ac6cd6a4?w=500&q=80";
      case "lunch":
        return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80";
      case "dinner":
        return "https://images.unsplash.com/photo-1576402187878-974f70c890a5?w=500&q=80";
      case "snack":
        return "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80";
      default:
        return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80";
    }
  };

  // Render welcome card
  const renderWelcomeCard = () => {
    if (!clientProfile) return null;
    
    return (
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeContent}>
          <View style={styles.profileSection}>
            <Image
              source={{ 
                uri: clientProfile.profileUrl || 'https://via.placeholder.com/100'
              }}
              style={styles.profileImage}
            />
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeGreeting}>
                Welcome back,
              </Text>
              <Text style={styles.clientName}>
                {clientProfile.name || 'Client'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/(client)/profile')}
          >
            <Ionicons name="person-circle-outline" size={24} color="#3E6B89" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <FontAwesome5 name="weight" size={16} color="#3E6B89" />
            <Text style={styles.statValue}>{clientProfile.weight} kg</Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <FontAwesome5 name="bullseye" size={16} color="#3E6B89" />
            <Text style={styles.statValue}>{clientProfile.goalWeight} kg</Text>
            <Text style={styles.statLabel}>Goal</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <FontAwesome5 name="fire" size={16} color="#3E6B89" />
            <Text style={styles.statValue}>{clientProfile.goalCalories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render meal plan
  const renderMealPlan = () => {
    if (!mealPlan || mealPlan.meals.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.noMealPlan}>No meal plan available</Text>
          <Text style={styles.emptyStateSubtext}>
            Your nutritionist will create a personalized meal plan for you soon.
          </Text>
        </View>
      );
    }

    return mealPlan.meals.map((meal, index) => {
      const mealType = getMealType(index);
      return (
        <View key={index} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <View style={styles.mealTypeContainer}>
              <Text style={styles.mealTypeText}>{mealType}</Text>
            </View>
          </View>
          <View style={styles.mealRow}>
            <Image
              source={{ uri: meal.recipe.image || getMealImage(mealType) }}
              style={styles.mealImage}
              resizeMode="cover"
            />
            <View style={styles.mealContent}>
              <Text style={styles.mealTitle}>{meal.recipe.label}</Text>
              <View style={styles.nutritionInfo}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                  <Text style={styles.nutritionValue}>{Math.round(meal.recipe.calories)}</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Serving</Text>
                  <Text style={styles.nutritionValue}>{meal.recipe.serving}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                permissions?.allowFoodLogging ? styles.primaryButton : styles.disabledButton
              ]}
              onPress={() => handleLog(meal)}
              // disabled={!permissions?.allowFoodLogging}
            >
              <Text style={[
                styles.actionText,
                permissions?.allowFoodLogging ? styles.activeButtonText : styles.disabledButtonText
              ]}>
                Log Meal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                permissions?.regenerateMeals ? styles.secondaryButton : styles.disabledButton
              ]}
              onPress={() => selectAlternative(meal)}
              disabled={!permissions?.regenerateMeals}
            >
              <Text style={[
                styles.actionText,
                permissions?.regenerateMeals ? styles.activeButtonText : styles.disabledButtonText
              ]}>
                Alternatives
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    });
  };

  if (loadingPermissions || loadingMealPlan) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3E6B89" />
        <Text style={styles.loadingText}>Loading your meal plan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderWelcomeCard()}
        <View style={styles.mealPlanSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            {mealPlan && (
              <Text style={styles.lastUpdated}>
                Updated {formatDistanceToNow(new Date(mealPlan.updatedAt))} ago
              </Text>
            )}
          </View>
          {renderMealPlan()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E9F0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2E3A59",
    letterSpacing: 0.3,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E9F0",
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealTypeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F1F5F9",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E9F0",
    width: "100%",
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3E6B89",
  },
  mealRow: {
    flexDirection: "row",
    padding: 16,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 16,
  },
  mealContent: {
    flex: 1,
    justifyContent: "center",
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E3A59",
    marginBottom: 8,
    lineHeight: 22,
  },
  nutritionInfo: {
    flexDirection: "row",
  },
  nutritionItem: {
    marginRight: 24,
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#8896AB",
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2E3A59",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E9F0",
    marginHorizontal: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    padding: 16,
    paddingTop: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 12,
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#3E6B89",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#8896AB",
  },
  disabledButton: {
    backgroundColor: "#F8F9FB",
    borderColor: "#E5E9F0",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeButtonText: {
    color: "#2E3A59",
  },
  disabledButtonText: {
    color: "#8896AB",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E9F0",
    padding: 30,
  },
  noMealPlan: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E3A59",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#8896AB",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8896AB",
  },
  welcomeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    marginTop:16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E9F0",
  },
  welcomeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  welcomeText: {
    flexDirection: "column",
  },
  welcomeGreeting: {
    fontSize: 14,
    color: "#8896AB",
  },
  clientName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E3A59",
  },
  profileButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E3A59",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8896AB",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E9F0",
    marginHorizontal: 16,
  },
  mealPlanSection: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E3A59",
  },
  lastUpdated: {
    fontSize: 12,
    color: "#8896AB",
  },
});

export default ClientMealPlanScreen;