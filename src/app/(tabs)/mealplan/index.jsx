import { useState, useEffect, useRef, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Platform,
} from "react-native"
import { router } from "expo-router"
import { MaterialIcons, Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { useMealPlanContext } from "../../context/MealPlanContext"
import { useuserDetailContext } from "../../context/UserDetailContext"
import { PieChart } from "react-native-chart-kit"
import { LinearGradient } from "expo-linear-gradient"
import { URL } from "@/src/constants/url"

const { width } = Dimensions.get("window")

// Helper functions
const getCaloriesFromNutrients = (nutrients) => {
  if (!nutrients || !Array.isArray(nutrients)) return 0;
  const energyNutrient = nutrients.find(n => n.label === "Energy");
  return energyNutrient?.value || 0;
};

const parseServingSize = (serving) => {
  if (typeof serving === 'number') return serving;
  if (typeof serving === 'string') {
    return parseFloat(serving.replace(/[^\d.-]/g, '')) || 1;
  }
  return 1;
};

const parseMealPlanData = (rawData) => {
  if (!rawData || !rawData.success) {
    return { error: "Invalid data received" };
  }

  try {
    return {
      meals: rawData.mealPlan.meals.map(meal => ({
        _id: meal._id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        mealType: meal.mealType || "Other",
        date: meal.date ? new Date(meal.date) : new Date(),
        dayNumber: meal.dayNumber || 1,
        recipe: {
          label: meal.recipe?.label || "Unnamed Recipe",
          image: meal.recipe?.image || "https://via.placeholder.com/100",
          calories: getCaloriesFromNutrients(meal.recipe?.nutrients),
          nutrients: meal.recipe?.nutrients || [],
          ingredientsLines: meal.recipe?.ingredientsLines || [],
          uri: meal.recipe?.uri || `temp_${meal._id || Date.now()}`,
          serving: parseServingSize(meal.recipe?.serving)
        },
        // Fix: Use alternateRecipes directly instead of nested recipes array
        alternateRecipes: Array.isArray(meal.alternateRecipes) ? 
          meal.alternateRecipes.map(alt => ({
            label: alt?.label || "Alternative Recipe",
            image: alt?.image || "https://via.placeholder.com/100",
            calories: typeof alt?.calories === 'string' ? 
              parseFloat(alt.calories) : (alt?.calories || 0),
            nutrients: alt?.nutrients || [],
            ingredientsLines: alt?.ingredientsLines || [],
            uri: alt?.uri || `alt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            serving: parseServingSize(alt?.serving)
          })) : []
      })),
      calories: rawData.userProfile?.goalCalories || 0,
      userProfile: {
        goalCalories: rawData.userProfile?.goalCalories || 0,
        macros: {
          protein: parseFloat(rawData.userProfile?.macros?.protein || 0),
          carbs: parseFloat(rawData.userProfile?.macros?.carbs || 0),
          fats: parseFloat(rawData.userProfile?.macros?.fats || 0),
          fiber: parseFloat(rawData.userProfile?.macros?.fiber || 0),
          nonFiberCarbs: parseFloat(rawData.userProfile?.macros?.nonFiberCarbs || 0),
          calories: parseFloat(rawData.userProfile?.macros?.calories || 0)
        }
      }
    };
  } catch (err) {
    console.error("Error parsing meal plan data:", err);
    return { error: "Failed to parse meal plan data" };
  }
};

const groupMealsByType = (meals) => {
  if (!meals || !Array.isArray(meals)) {
    return {};
  }

  const mealTypeOrder = ["Breakfast", "Lunch", "Dinner", "Snack"];
  
  // Group meals by type
  const grouped = meals.reduce((acc, meal) => {
    if (!meal || !meal.mealType) return acc;
    
    const mealType = meal.mealType;
    if (!acc[mealType]) {
      acc[mealType] = [];
    }
    
    acc[mealType].push(meal);
    return acc;
  }, {});
  
  // Sort meal types in the desired order
  return Object.fromEntries(
    mealTypeOrder
      .filter(type => grouped[type])
      .map(type => [type, grouped[type]])
      .concat(
        Object.entries(grouped).filter(([type]) => !mealTypeOrder.includes(type))
      )
  );
};

const calculateMacroPercentages = (macros) => {
  const { protein, carbs, fats } = macros;
  const total = protein + carbs + fats;
  
  if (total === 0) return { protein: 0, carbs: 0, fats: 0 };
  
  return {
    protein: Math.round((protein / total) * 100),
    carbs: Math.round((carbs / total) * 100),
    fats: Math.round((fats / total) * 100)
  };
};

const STORAGE_KEYS = {
  MEAL_PLAN: 'mealPlan',
  MEAL_PLAN_TIMESTAMP: 'mealPlanTimestamp',
  MEAL_PLAN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  CHECKED_MEALS: 'checkedMeals' // Add new key for checked meals
};

const isStoredPlanValid = async () => {
  try {
    const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.MEAL_PLAN_TIMESTAMP);
    if (!timestamp) return false;

    const storedTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    return currentTime - storedTime < STORAGE_KEYS.MEAL_PLAN_EXPIRY;
  } catch (error) {
    console.error('Error checking stored plan validity:', error);
    return false;
  }
};

const MealPlanPage = () => {
  // 1. All useState hooks
  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState(null);
  const [error, setError] = useState(null);
  const [checkedMeals, setCheckedMeals] = useState({});
  const [menuVisible, setMenuVisible] = useState(null);

  // 2. All useContext hooks
  const { userDetail } = useuserDetailContext();
  const { selectedRecipes } = useMealPlanContext();

  // 3. All useRef hooks
  const progressAnimationRef = useRef(new Animated.Value(0)).current;

  // 4. All useMemo hooks
  const groupedMeals = useMemo(() => {
    return groupMealsByType(mealPlan?.meals);
  }, [mealPlan?.meals]);

  const nutritionData = useMemo(() => {
    if (!mealPlan?.userProfile?.macros) return { protein: 0, carbs: 0, fats: 0 };
    
    return {
      protein: parseFloat(mealPlan.userProfile.macros.protein || 0),
      carbs: parseFloat(mealPlan.userProfile.macros.carbs || 0),
      fats: parseFloat(mealPlan.userProfile.macros.fats || 0)
    };
  }, [mealPlan?.userProfile?.macros]);

  const macroPercentages = useMemo(() => {
    return calculateMacroPercentages(nutritionData);
  }, [nutritionData]);

  const chartData = useMemo(() => {
    return [
      {
        name: "Protein",
        population: nutritionData.protein,
        color: "#5E60CE",
        legendFontColor: "#333333",
        legendFontSize: 12,
        percentage: macroPercentages.protein,
      },
      {
        name: "Carbs",
        population: nutritionData.carbs,
        color: "#64DFDF",
        legendFontColor: "#333333",
        legendFontSize: 12,
        percentage: macroPercentages.carbs,
      },
      {
        name: "Fats",
        population: nutritionData.fats,
        color: "#FF9F1C",
        legendFontColor: "#333333",
        legendFontSize: 12,
        percentage: macroPercentages.fats,
      },
    ];
  }, [nutritionData, macroPercentages]);

  // 5. All useEffect hooks
  useEffect(() => {
    // loadMealPlanData();
    fetchMealPlan();
    // loadCheckedMeals();
  }, []);

  // Enhanced effect for progress animation
  useEffect(() => {
    const totalMeals = Object.values(groupedMeals).flat().length;
    const completedMealsCount = Object.keys(checkedMeals).filter((key) => checkedMeals[key]).length;
    const progressPercentage = totalMeals > 0 ? (completedMealsCount / totalMeals) * 100 : 0;

    Animated.timing(progressAnimationRef, {
      toValue: progressPercentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [checkedMeals, groupedMeals]);

  const API_URL = `${URL}/generate/meals`;

  const loadCheckedMeals = async () => {
    try {
      const savedCheckedMeals = await AsyncStorage.getItem("checkedMeals");
      if (savedCheckedMeals) {
        setCheckedMeals(JSON.parse(savedCheckedMeals));
      }
    } catch (err) {
      console.error("Error loading checked meals", err);
    }
  };

  const saveCheckedMeals = async (updatedCheckedMeals) => {
    try {
      await AsyncStorage.setItem("checkedMeals", JSON.stringify(updatedCheckedMeals));
    } catch (err) {
      console.error("Error saving checked meals", err);
    }
  };

  const loadMealPlanData = async () => {
    try {
      const storedMealPlan = await AsyncStorage.getItem("mealPlan");
      const storedTimestamp = await AsyncStorage.getItem("mealPlanTimestamp");

      if (storedMealPlan && storedTimestamp) {
        const currentTime = new Date().getTime();
        const storedTime = Number.parseInt(storedTimestamp, 10);

        // If stored meal plan is less than 24 hours old, use it
        if (currentTime - storedTime < 24 * 60 * 60 * 1000) {
          setMealPlan(JSON.parse(storedMealPlan));
          setLoading(false);
          return;
        } else {
          await AsyncStorage.removeItem("mealPlan");
          await AsyncStorage.removeItem("mealPlanTimestamp");
        }
      }

      // Fetch from API if no valid stored data
      fetchMealPlan();
    } catch (err) {
      console.error("Error loading meal plan from storage", err);
      fetchMealPlan();
    }
  };

  const fetchMealPlan = async () => {
    try {
      setLoading(true);

      // Try to get both stored meal plan and checked meals
      const [storedPlan, storedCheckedMeals] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.MEAL_PLAN),
        AsyncStorage.getItem(STORAGE_KEYS.CHECKED_MEALS)
      ]);
      
      const isValid = await isStoredPlanValid();
  
      // Restore checked meals if available
      if (storedCheckedMeals) {
        setCheckedMeals(JSON.parse(storedCheckedMeals));
      }
  
      if (storedPlan && isValid) {
        console.log('Using stored meal plan');
        const parsedPlan = JSON.parse(storedPlan);
        setMealPlan(parsedPlan);
        setLoading(false);
        return;
      }
  
      if (!userDetail?.regularId) {
        setError("User ID not found. Please log in again.");
        return;
      }
  
      console.log('Generating new meal plan');
      const response = await axios.post(API_URL, {
        userId: userDetail.regularId,
        dietaryPreferences: [],
        healthLabels: [],
      });
  
      if (response.status === 200 && response.data.success) {
        const formattedData = parseMealPlanData(response.data);
        
        if (formattedData.error) {
          setError(formattedData.error);
        } else {
          // Store the new meal plan and reset checked meals
          await Promise.all([
            AsyncStorage.multiSet([
              [STORAGE_KEYS.MEAL_PLAN, JSON.stringify(formattedData)],
              [STORAGE_KEYS.MEAL_PLAN_TIMESTAMP, Date.now().toString()]
            ]),
            AsyncStorage.setItem(STORAGE_KEYS.CHECKED_MEALS, JSON.stringify({}))
          ]);
          
          setMealPlan(formattedData);
          setCheckedMeals({}); // Reset checked meals for new plan
        }
      } else {
        setError("Failed to load meal plan.");
      }
    } catch (err) {
      console.error("Error in fetchMealPlan:", err);
      setError("An error occurred while fetching the meal plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleLog = (meal, index) => {
    if (!meal) {
      console.error("Error: Meal object is missing");
      return;
    }
    
    if (!userDetail || !userDetail.regularId) {
      console.error("Error: User details or user ID is missing");
      return;
    }
    
    // Find the meal in the grouped meals
    let mealToLog = meal;
    
    if (!meal.recipe && index) {
      const [mealType, mealIdx] = index.split('-');
      const mealsOfType = groupedMeals[mealType];
      if (mealsOfType && mealsOfType[parseInt(mealIdx)]) {
        mealToLog = mealsOfType[parseInt(mealIdx)];
      }
    }
    
    if (!mealToLog || !mealToLog.recipe) {
      console.error("Error: Unable to find valid meal data");
      return;
    }
    
    const recipe = mealToLog.recipe;
    const nutrients = recipe.nutrients || [];
    
    // Helper function to safely extract nutrient values
    const getNutrientValue = (index, defaultValue = 0) => {
      if (!nutrients || !Array.isArray(nutrients) || !nutrients[index]) return defaultValue;
      return Math.round(nutrients[index].value || defaultValue);
    };
    
    // Prepare the food log entry with safe fallbacks
    let foodLogEntry = {
      regularUserId: userDetail.regularId,
      foodId: recipe.uri ? recipe.uri.split("#recipe_")[1] : `manual-entry-${Date.now()}`,
      foodName: recipe.label || "Meal from plan",
      image: recipe.image || "",
      measure: "serving",
      quantity: 1,
      mealType: mealToLog.mealType || "meal", 
      calories: `${getNutrientValue(0)}Kcal`,
      protein: `${getNutrientValue(10)}g`,
      fats: `${getNutrientValue(1)}g`,
      fiber: `${getNutrientValue(8)}g`,
      carbs: `${getNutrientValue(6)}g`,
      sugar: `${getNutrientValue(9)}g`,
      cholestrol: `${getNutrientValue(11)}mg`,
      iron: `${getNutrientValue(15)}mg`,
      magnesium: `${getNutrientValue(13)}mg`,
      potassium: `${getNutrientValue(14)}mg`,
      sodium: `${getNutrientValue(12)}mg`,
      zinc: `${getNutrientValue(16)}mg`,
      vitaminB12: `${getNutrientValue(27)}mg`,
      VitaminB6: `${getNutrientValue(23)}mg`,
      VitaminC: `${getNutrientValue(19)}mg`,
      VitaminD: `${getNutrientValue(28)}mg`,
      thiamin: `${getNutrientValue(20)}mg`,
    };
    
    // Make the API call
    axios
      .post(`${URL}/foodlog/add`, foodLogEntry, {
        headers: { "Content-Type": "application/json" },
      })
      .then(response => {
        console.log("Food logged successfully");
      })
      .catch(error => {
        console.error("Error logging food", error.response?.data || error.message);
      });
  };

  const markMealAsCompleted = async (index) => {
    if (!checkedMeals[index]) {
      const updatedCheckedMeals = {
        ...checkedMeals,
        [index]: true,
      };
      
      try {
        // Save checked meals to storage
        await AsyncStorage.setItem(
          STORAGE_KEYS.CHECKED_MEALS, 
          JSON.stringify(updatedCheckedMeals)
        );
        setCheckedMeals(updatedCheckedMeals);
        
        const [mealType, mealIdx] = index.split('-');
        if (groupedMeals[mealType] && groupedMeals[mealType][parseInt(mealIdx)]) {
          const meal = groupedMeals[mealType][parseInt(mealIdx)];
          handleLog(meal, index);
        }
      } catch (error) {
        console.error('Error saving checked meals:', error);
      }
    }
  };

  // Toggle the meal options menu
  const toggleMenu = (mealId) => {
    setMenuVisible(menuVisible === mealId ? null : mealId);
  };

  // Replace a meal with an alternative
  const replaceMeal = async (originalMeal, alternateRecipe) => {
    if (!mealPlan || !mealPlan.meals) return;
    
    const updatedMeals = mealPlan.meals.map(meal => {
      if (meal._id === originalMeal._id) {
        return {
          ...meal,
          recipe: alternateRecipe
        };
      }
      return meal;
    });
    
    const updatedMealPlan = {
      ...mealPlan,
      meals: updatedMeals
    };
  
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MEAL_PLAN, JSON.stringify(updatedMealPlan));
      setMealPlan(updatedMealPlan);
      setMenuVisible(null);
    } catch (error) {
      console.error('Error updating stored meal plan:', error);
    }
  };

  // Navigate to recipe details
  const navigateToRecipeDetails = (recipe) => {
    if (!recipe) return;
    router.push({
      pathname: "/mealplan/[mealDetail]",
      params: { recipeUri: encodeURIComponent(JSON.stringify(recipe))}
    });
  };

  // Render meal item component
  const renderMealItem = (meal, index, mealType) => {
    if (!meal || !meal.recipe) return null;
    
    const mealKey = `${mealType}-${index}`;
    const isChecked = checkedMeals[mealKey];
    const recipe = meal.recipe;
    
    // Fix: Check alternateRecipes array directly
    const hasAlternatives = Array.isArray(meal.alternateRecipes) && meal.alternateRecipes.length > 0;
  
    console.log('Meal alternatives:', {
      mealId: meal._id,
      hasAlternatives,
      alternativeCount: meal.alternateRecipes?.length || 0
    });
  
    return (
      <View key={mealKey} style={styles.mealItem}>
        <TouchableOpacity
          style={styles.mealHeader}
          onPress={() => navigateToRecipeDetails(recipe)}
        >
          <View style={styles.mealInfo}>
            <Image
              source={{ uri: recipe.image }}
              style={styles.mealImage}
              resizeMode="cover"
            />
            <View style={styles.mealDetails}>
              <Text 
                style={styles.mealTitle}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {recipe.label}
              </Text>
              <Text style={styles.mealCalories}>
                {Math.round(recipe.calories)} calories
              </Text>
            </View>
          </View>
  
          <View style={styles.mealActions}>
            <TouchableOpacity
              onPress={() => markMealAsCompleted(mealKey)}
              style={[styles.checkButton, isChecked && styles.checkedButton]}
            >
              <Ionicons 
                name={isChecked ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color={isChecked ? "#5D9C59" : "#666"} 
              />
            </TouchableOpacity>
            
            {hasAlternatives && (
              <TouchableOpacity
                onPress={() => toggleMenu(meal._id)}
                style={styles.menuButton}
              >
                <MaterialIcons 
                  name={menuVisible === meal._id ? "expand-less" : "expand-more"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
  
        {menuVisible === meal._id && hasAlternatives && (
          <View style={styles.menuOptions}>
            <Text style={styles.menuTitle}>Alternative Options:</Text>
            {meal.alternateRecipes.map((alt, altIndex) => (
              <TouchableOpacity
                key={altIndex}
                style={styles.alternateOption}
                onPress={() => replaceMeal(meal, alt)}
              >
                <Image 
                  source={{ uri: alt.image }} 
                  style={styles.alternateImage} 
                />
                <View style={styles.alternateInfo}>
                  <Text numberOfLines={1} style={styles.alternateText}>
                    {alt.label}
                  </Text>
                  <Text style={styles.alternateCalories}>
                    {Math.round(alt.calories)} calories
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Calculate progress width for the animation
  const progressWidth = progressAnimationRef.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5E60CE" />
        <Text style={styles.loadingText}>Loading your meal plan...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={60} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchMealPlan();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!mealPlan || !mealPlan.meals || mealPlan.meals.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="no-meals" size={60} color="#64DFDF" />
        <Text style={styles.errorText}>No meal plan available.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            fetchMealPlan();
          }}
        >
          <Text style={styles.retryButtonText}>Generate Meal Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <LinearGradient
          colors={["#5E60CE", "#64DFDF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Your Meal Plan</Text>
          <Text style={styles.headerSubtitle}>
            {mealPlan.userProfile?.goalCalories? `${mealPlan.userProfile.goalCalories} calories daily goal`: "Personalized nutrition plan"}
          </Text>
        </LinearGradient>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.progressTracker}>
            <View style={styles.progressBackground}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressWidth }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Object.keys(checkedMeals).filter(key => checkedMeals[key]).length} of{" "}
              {Object.values(groupedMeals).flat().length} meals completed
            </Text>
          </View>
        </View>

        {/* Nutrition Section */}
        <View style={styles.nutritionSection}>
          <Text style={styles.sectionTitle}>Nutrition Breakdown</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              width={width * 0.9}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute={false}
            />
          </View>
          <View style={styles.macroDetails}>
            <View style={styles.macroItem}>
              <View style={[styles.macroColor, { backgroundColor: "#5E60CE" }]} />
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{nutritionData.protein}g</Text>
              <Text style={styles.macroPercentage}>{macroPercentages.protein}%</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroColor, { backgroundColor: "#64DFDF" }]} />
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{nutritionData.carbs}g</Text>
              <Text style={styles.macroPercentage}>{macroPercentages.carbs}%</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroColor, { backgroundColor: "#FF9F1C" }]} />
              <Text style={styles.macroLabel}>Fats</Text>
              <Text style={styles.macroValue}>{nutritionData.fats}g</Text>
              <Text style={styles.macroPercentage}>{macroPercentages.fats}%</Text>
            </View>
          </View>
        </View>

        {/* Meals Section */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          
          {Object.entries(groupedMeals).map(([mealType, meals]) => (
            <View key={mealType} style={styles.mealTypeContainer}>
              <View style={styles.mealTypeHeader}>
                <Text style={styles.mealTypeTitle}>{mealType}</Text>
                <View style={styles.divider} />
              </View>
              
              {meals.map((meal, index) => renderMealItem(meal, index, mealType))}
            </View>
          ))}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#5E60CE",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  progressSection: {
    padding: 15,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 15,
  },
  progressTracker: {
    alignItems: "center",
  },
  progressBackground: {
    height: 10,
    width: "100%",
    backgroundColor: "#E8E8E8",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#5E60CE",
    borderRadius: 5,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666666",
  },
  nutritionSection: {
    padding: 15,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  macroDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  macroColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 5,
  },
  macroLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 3,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  macroPercentage: {
    fontSize: 14,
    color: "#888888",
  },
  mealsSection: {
    padding: 15,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  mealTypeContainer: {
    marginBottom: 20,
  },
  mealTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  mealTypeTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333333",
    marginRight: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  mealItem: {
    marginBottom: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    overflow: "hidden",
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  mealInfo: {
    flexDirection: "row",
    flex: 1,
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  mealDetails: {
    flex: 1,
    justifyContent: "center",
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 14,
    color: "#666666",
  },
  mealActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkButton: {
    padding: 5,
  },
  checkedButton: {
    padding: 5,
  },
  menuButton: {
    padding: 5,
    marginLeft: 5,
  },
  menuOptions: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    padding: 10,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  alternateOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  alternateText: {
    flex: 1,
    fontSize: 14,
    color: "#444444",
  },
  alternateCalories: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 10,
  },
  alternateImage: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
  },
  
  alternateImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
  },
  alternateInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  menuOptions: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    padding: 15,
  },
  alternateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
});

export default MealPlanPage;