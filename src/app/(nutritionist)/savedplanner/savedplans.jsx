import { useState, useCallback, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Image, 
  Animated, 
  Dimensions, 
  ActivityIndicator,
  RefreshControl,
  Platform
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import axios from 'axios';
import { useSavedPlanContext } from "../../context/savedPlanContext";
import { useFocusEffect } from "@react-navigation/native";
import { URL } from "@/src/constants/url";
import { useNutritionistDetailContext } from "../../context/NutritionistContext";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { ref } from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window')    ;

// Define meal icons mapping with colors
const mealIcons = {
  "Breakfast": { icon: "sunny-outline", color: "#FF9800", gradient: ["#FFC107", "#FF9800"] },
  "Lunch": { icon: "restaurant-outline", color: "#4CAF50", gradient: ["#8BC34A", "#4CAF50"] },
  "Dinner": { icon: "moon-outline", color: "#3F51B5", gradient: ["#5C6BC0", "#3F51B5"] },
  "Snack": { icon: "nutrition-outline", color: "#E91E63", gradient: ["#F06292", "#E91E63"] },
  "Morning Snack": { icon: "cafe-outline", color: "#795548", gradient: ["#A1887F", "#795548"] },
  "Afternoon Snack": { icon: "ice-cream-outline", color: "#9C27B0", gradient: ["#BA68C8", "#9C27B0"] },
  "Evening Snack": { icon: "wine-outline", color: "#607D8B", gradient: ["#78909C", "#607D8B"] },
  "Supplements": { icon: "fitness-outline", color: "#FF5722", gradient: ["#FF8A65", "#FF5722"] }
};

// Safe text rendering helper function
const safeText = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return value.toString();
  return JSON.stringify(value);
};

const MealPlanScreen = () => {
  const [mealPlanData, setMealPlanData] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedMeals, setExpandedMeals] = useState({});
  const [loading, setLoading] = useState(true);
  const { savedPlanData } = useSavedPlanContext();
  const { nutritionistDetail, setRefreshMealPlanFlag, refreshMealPlanFlag } = useNutritionistDetailContext();
  const [isPlanGenerated, setIsPlanGenerated] = useState(false);

  const router = useRouter();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dayScrollRef = useRef(null);
  const mealScrollRef = useRef(null);

  // Format date to day name with error handling
  const getDayName = (dateString) => {
    try {
      if (!dateString) return 'Day';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } catch (error) {
      console.log("Error getting day name:", error);
      return 'Day';
    }
  };
  
  // Get short date format with error handling
  const getFormattedDate = (dateString) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      console.log("Error formatting date:", error);
      return '';
    }
  };

  const fetchMealPlan = async () => {
    try {
      setLoading(true);
      fadeAnim.setValue(0);
      
      // Use the new API endpoint we created
      const response = await axios.get(`${URL}/uploadPlan/fetch-multiday-mealplans`, {
        params: {
          userId: savedPlanData?.userId, 
          nutritionistId: nutritionistDetail?.userId
        }
      });

      if (response.data?.success && response.data?.mealPlan?.meals) {
        // Group meals by day
        const mealsByDay = {};
        response.data.mealPlan.meals.forEach(meal => {
          const dayNumber = meal.dayNumber;
          if (!mealsByDay[dayNumber]) {
            mealsByDay[dayNumber] = [];
          }
          mealsByDay[dayNumber].push(meal);
        });

        const formattedMealPlan = {
          mealPlan: Object.keys(mealsByDay).map(dayNumber => ({
            day: parseInt(dayNumber),
            date: new Date(response.data.mealPlan.startDate).setDate(
              new Date(response.data.mealPlan.startDate).getDate() + parseInt(dayNumber) - 1
            ),
            meals: mealsByDay[dayNumber].map(meal => ({
              mealType: meal.mealType,
              recipe: {
                id: meal.recipe?.id,
                label: meal.recipe?.label || 'Untitled Recipe',
                calories: meal.recipe?.calories?.toString() || '0',
                image: meal.recipe?.image || null,
                serving: meal.recipe?.serving || 1,
                ingredientsLines: meal.recipe?.ingredientsLines || [],
                totalNutrients: meal.recipe?.nutrients?.reduce((acc, nutrient) => {
                  acc[nutrient.label] = {
                    quantity: parseFloat(nutrient.value),
                    unit: nutrient.unit
                  };
                  return acc;
                }, {}),
                url: meal.recipe?.url,
                cautions: meal.recipe?.cautions || []
              },
              alternateRecipes: meal.alternateRecipes || [] // Store as direct array
            }))
          })),
          userProfile: {
            type: response.data.userProfile.type || 'Custom',
            goalCalories: parseInt(response.data.userProfile.goalCalories) || 2000,
            macros: {
              protein: parseInt(response.data.userProfile.macros.protein) || 0,
              carbs: parseInt(response.data.userProfile.macros.carbs) || 0,
              fats: parseInt(response.data.userProfile.macros.fats) || 0
            }
          }
        };
        setMealPlanData(formattedMealPlan);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error("Error fetching meal plan:", error);
      setMealPlanData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
      // Reset the flag after fetching
      if (refreshMealPlanFlag) {
        setRefreshMealPlanFlag(false);
      }
    }
  };

  useFocusEffect(
    useCallback(()=>{
      if(refreshMealPlanFlag){
        fetchMealPlan();
        setRefreshMealPlanFlag(false)
      }
    },[refreshMealPlanFlag, fetchMealPlan])
  )

  const savePlanGeneratedFlag = async (value) => {
    try {
      await AsyncStorage.setItem('isPlanGenerated', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving plan generated flag:', error);
    }
  };

  // Add function to load flag from AsyncStorage
  const loadPlanGeneratedFlag = async () => {
    try {
      const value = await AsyncStorage.getItem('isPlanGenerated');
      console.log('Loaded plan generated flag:', value);
      return value ? JSON.parse(value) : false;
    } catch (error) {
      console.error('Error loading plan generated flag:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeFlag = async () => {
      const flagValue = await loadPlanGeneratedFlag();
      console.log('Initial plan generated flag:', flagValue);
      setIsPlanGenerated(flagValue);
    };
    initializeFlag();
  }, []);

  const generateMealPlan = async () => {
    try {
      setLoading(true);
      fadeAnim.setValue(0);
      
      const response = await axios.post(`${URL}/multi-day-generator/mealplan`, {
        userId: savedPlanData?.userId, 
        nutritionistId: nutritionistDetail?.userId,
        numberOfDays: savedPlanData?.numberOfDays || 7,
        dietaryPreference: [],
      });

      // console.log("Full response:", JSON.stringify(response.data, null, 2));

      if (response.data?.success && response.data?.mealPlan?.meals) {
        // Group meals by day
        const mealsByDay = {};
        response.data.mealPlan.meals.forEach(meal => {
          const dayNumber = meal.dayNumber;
          if (!mealsByDay[dayNumber]) {
            mealsByDay[dayNumber] = [];
          }
          mealsByDay[dayNumber].push(meal);
        });

        const formattedMealPlan = {
          mealPlan: Object.keys(mealsByDay).map(dayNumber => ({
            day: parseInt(dayNumber),
            date: new Date(response.data.mealPlan.startDate).setDate(
              new Date(response.data.mealPlan.startDate).getDate() + parseInt(dayNumber) - 1
            ),
            meals: mealsByDay[dayNumber].map(meal => ({
              mealType: meal.mealType,
              recipe: {
                id: meal.recipe?.id,
                label: meal.recipe?.label || 'Untitled Recipe',
                calories: meal.recipe?.calories?.toString() || '0',
                image: meal.recipe?.image || null,
                serving: meal.recipe?.serving || 1,
                ingredientsLines: meal.recipe?.ingredientsLines || [],
                totalNutrients: meal.recipe?.nutrients?.reduce((acc, nutrient) => {
                  acc[nutrient.label] = {
                    quantity: parseFloat(nutrient.value),
                    unit: nutrient.unit
                  };
                  return acc;
                }, {}),
                url: meal.recipe?.url,
                cautions: meal.recipe?.cautions || []
              },
              alternateRecipes: meal.alternateRecipes || [] // Store as direct array
            }))
          })),
          userProfile: {
            type: response.data.userProfile.type || 'Custom',
            goalCalories: parseInt(response.data.userProfile.goalCalories) || 2000,
            macros: {
              protein: parseInt(response.data.userProfile.macros.protein) || 0,
              carbs: parseInt(response.data.userProfile.macros.carbs) || 0,
              fats: parseInt(response.data.userProfile.macros.fats) || 0
            }
          }
        };

        // console.log('Formatted meal plan:', JSON.stringify(formattedMealPlan, null, 2));
        setMealPlanData(formattedMealPlan);
        setIsPlanGenerated(true);
        await savePlanGeneratedFlag(true);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error("Error generating plan:", error);
      setMealPlanData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Only generate if flag is explicitly false, not null or undefined
    if (isPlanGenerated === false) {
      console.log("Generating new meal plan because isPlanGenerated is false");
      generateMealPlan();
    } else {
      console.log("Skipping plan generation, isPlanGenerated:", isPlanGenerated);
      // If plan is generated but we don't have data, fetch it
      if (isPlanGenerated && !mealPlanData) {
        console.log("Fetching existing meal plan");
        fetchMealPlan();
      }
    }
  }, [isPlanGenerated]); 
  

  // Toggle meal expansion
  const toggleMealExpansion = useCallback((mealId) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealId]: !prev[mealId]
    }));
  }, []);

  // Get days array from meal plan data with error handling
  const getDaysArray = () => {
    if (!mealPlanData || !Array.isArray(mealPlanData.mealPlan)) return [];
    
    return mealPlanData.mealPlan.map(day => ({
      dayName: getDayName(day?.date),
      shortDate: getFormattedDate(day?.date),
      date: day?.date || '',
      day: day?.day || ''
    }));
  };

  const days = getDaysArray();

  // Handle day selection with animation
  const handleDaySelect = (index) => {
    setSelectedDayIndex(index);
    
    // Scroll to the selected day
    if (dayScrollRef.current) {
      dayScrollRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5
      });
    }
    
    // Animate meal list
    if (mealScrollRef.current) {
      mealScrollRef.current.scrollToOffset({ offset: 0, animated: true });
    }
    
    // Reset expanded meals
    setExpandedMeals({});
  };

  const renderDayItem = ({ item, index }) => {
    const isSelected = selectedDayIndex === index;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isToday = item.shortDate === today;
    
    return (
      <TouchableOpacity
        style={[
          styles.dayItem, 
          isSelected && styles.selectedDayItem,
          isToday && styles.todayItem
        ]}
        onPress={() => handleDaySelect(index)}
      >
        {isToday && <View style={styles.todayDot} />}
        <Text style={[
          styles.dayText, 
          isSelected && styles.selectedDayText,
          isToday && !isSelected && styles.todayText
        ]}>
          {typeof item.dayName === 'string' ? item.dayName.slice(0, 3) : 'Day'}
        </Text>
        <Text style={[
          styles.dateText, 
          isSelected && styles.selectedDayText,
          isToday && !isSelected && styles.todayText
        ]}>
          {item.shortDate || ''}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMealItem = ({ item: meal, index }) => {
    if (!meal) return null;
  
    const mealId = `meal-${index}-${meal.mealType}`;
    const isExpanded = expandedMeals[mealId];
    const mealInfo = mealIcons[meal.mealType] || { 
      icon: "nutrition-outline", 
      color: "#FF6B00",
      gradient: ["#FF9248", "#FF6B00"]
    };
  
    const recipe = meal.recipe && typeof meal.recipe === 'object' ? meal.recipe : {};
    const mealType = typeof meal.mealType === 'string' ? meal.mealType : 'Meal';
  
    // Update the mealActions part in renderMealItem
    const mealActions = (
      <View style={styles.mealActions}>
        <TouchableOpacity 
          onPress={() => {
            const mealData = {
              currentRecipe: meal.recipe,
              alternateRecipes: {
                recipes: Array.isArray(meal.alternateRecipes) ? meal.alternateRecipes : [],
                mealType: meal.mealType
              },
              mealType: meal.mealType,
              clientId: savedPlanData?.userId
            };

            // First stringify, then encode
            const encodedData = encodeURIComponent(JSON.stringify(mealData));
            
            if (Platform.OS === "ios") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          
            router.push({
              pathname: '/savedplanner/[alternateRecipe]',
              params: {
                recipes: encodedData, // Use the properly encoded data
                source: "multiday"
              }
            });
          }}
          style={styles.alternativesButton}
        >
          <Ionicons name="refresh-outline" size={20} color={mealInfo.color} />
          <Text style={[styles.alternativesCount, { color: mealInfo.color }]}>
            {Array.isArray(meal.alternateRecipes) ? meal.alternateRecipes.length : 0}
          </Text>
        </TouchableOpacity>
        
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#888"
        />
      </View>
    );
  
    return (
      <Animated.View 
        style={[
          styles.mealCard,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity 
          style={styles.mealHeader}
          onPress={() => toggleMealExpansion(mealId)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={mealInfo.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.mealIconContainer}
          >
            <Ionicons name={mealInfo.icon} size={24} color="#FFF" />
          </LinearGradient>
          
          <View style={styles.mealTitleContainer}>
            <Text style={styles.mealTitle}>{mealType}</Text>
            {recipe && recipe.calories && (
              <Text style={styles.mealCalories}>
                {typeof recipe.calories === 'number' || typeof recipe.calories === 'string' 
                  ? `${recipe.calories} cal` 
                  : ""}
              </Text>
            )}
          </View>
          
          {mealActions}
        </TouchableOpacity>
        
        {/* Render recipe details */}
        {recipe && Object.keys(recipe).length > 0 && (
          <View style={[styles.recipeContainer, !isExpanded && styles.recipeContainerCollapsed]}>
            {/* Recipe image */}
            {recipe.image && typeof recipe.image === 'string' ? (
              <Image 
                source={{ uri: recipe.image }} 
                style={styles.recipeImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.recipeImagePlaceholder}>
                <Ionicons name="image-outline" size={30} color="#DDD" />
              </View>
            )}
            
            {/* Recipe details */}
            <View style={styles.recipeDetails}>
              <Text style={styles.recipeTitle} numberOfLines={isExpanded ? 0 : 2}>
                {typeof recipe.label === 'string' ? recipe.label : "Recipe"}
              </Text>
              
              {/* Render additional details if expanded */}
              {isExpanded && recipe.ingredientsLines && Array.isArray(recipe.ingredientsLines) && (
                <View style={styles.ingredientsList}>
                  <Text style={styles.ingredientsTitle}>Ingredients:</Text>
                  {recipe.ingredientsLines.slice(0, 3).map((ingredient, idx) => (
                    <View key={idx} style={styles.ingredientRow}>
                      <View style={styles.ingredientBullet} />
                      <Text style={styles.ingredientItem}>{ingredient}</Text>
                    </View>
                  ))}
                  {recipe.ingredientsLines.length > 3 && (
                    <Text style={styles.moreIngredientsText}>
                      +{recipe.ingredientsLines.length - 3} more ingredients
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}
      </Animated.View>
    );
  };
  

  // Get current day's meals with better error handling
  const getCurrentDayMeals = () => {
    if (!mealPlanData || 
        !Array.isArray(mealPlanData.mealPlan) || 
        !mealPlanData.mealPlan[selectedDayIndex]) {
      return [];
    }
    
    const currentDay = mealPlanData.mealPlan[selectedDayIndex];
    if (!currentDay || !Array.isArray(currentDay.meals)) {
      return [];
    }
    
    return currentDay.meals;
  };

  const currentDayMeals = getCurrentDayMeals();

  // Get plan title based on user profile with error handling
const getPlanTitle = () => {
  if (!mealPlanData || typeof mealPlanData.userProfile !== 'object') {
    return 'Meal Plan';
  }

  const type = mealPlanData.userProfile.type;
  if (typeof type !== 'string') {
    return 'Custom Meal Plan';
  }

  // Capitalize first letter and add "Meal Plan"
  return `${type.charAt(0).toUpperCase()}${type.slice(1)} Meal Plan`;
};

// Get daily nutrition summary
const getDailyNutrition = () => {
  if (!Array.isArray(currentDayMeals)) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
  
  return currentDayMeals.reduce((acc, meal) => {
    const recipe = meal.recipe || {};
    
    const calories = recipe.calories ? parseInt(recipe.calories) : 0;
    const protein = recipe.totalNutrients?.Protein?.quantity || 0;
    const carbs = recipe.totalNutrients?.Carbs?.quantity || 0;
    const fat = recipe.totalNutrients?.Fat?.quantity || 0;

    return {
      calories: acc.calories + calories,
      protein: acc.protein + protein,
      carbs: acc.carbs + carbs,
      fat: acc.fat + fat
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
};

  const dailyNutrition = getDailyNutrition();
  const goalCalories = mealPlanData?.userProfile?.goalCalories || 2000;
  const caloriePercentage = Math.min(100, Math.round((dailyNutrition.calories / goalCalories) * 100));

  return (
    <View style={styles.container}>
      <Animated.ScrollView
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>{getPlanTitle()}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color="#FFF" />
              <Text style={styles.editButtonText}>Edit Plan</Text>
            </TouchableOpacity>
          </View>
          
          {!loading && mealPlanData && (
            <Animated.View 
              style={[styles.nutritionSummary, { opacity: fadeAnim }]}
            >
              <View style={styles.calorieProgress}>
                <View style={styles.calorieProgressInner}>
                  <Text style={styles.calorieText}>
                    {Math.round(dailyNutrition.calories)}
                  </Text>
                  <Text style={styles.calorieLabel}>cal</Text>
                </View>
                <View style={styles.calorieProgressBar}>
                  <View 
                    style={[
                      styles.calorieProgressFill, 
                      { width: `${caloriePercentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.calorieGoal}>
                  Goal: {goalCalories} cal
                </Text>
              </View>
              
              <View style={styles.macroSummary}>
                <View style={styles.macroSummaryItem}>
                  <Text style={[styles.macroValue, { color: '#5E60CE' }]}>
                    {Math.round(dailyNutrition.protein)}g
                  </Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroSummaryItem}>
                  <Text style={[styles.macroValue, { color: '#64DFDF' }]}>
                    {Math.round(dailyNutrition.carbs)}g
                  </Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroSummaryItem}>
                  <Text style={[styles.macroValue, { color: '#FF9F1C' }]}>
                    {Math.round(dailyNutrition.fat)}g
                  </Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
              </View>
            </Animated.View>
          )}
        </View>

        {days.length > 0 ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            <FlatList
              ref={dayScrollRef}
              data={days}
              renderItem={renderDayItem}
              keyExtractor={(item, index) => `day-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dayList}
              contentContainerStyle={styles.dayListContent}
              initialScrollIndex={selectedDayIndex}
              getItemLayout={(data, index) => ({
                length: 80,
                offset: 80 * index,
                index,
              })}
            />
          </Animated.View>
        ) : null}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={styles.loadingText}>Loading your meal plan...</Text>
          </View>
        ) : Array.isArray(currentDayMeals) && currentDayMeals.length > 0 ? (
          <FlatList 
            ref={mealScrollRef}
            data={currentDayMeals} 
            renderItem={renderMealItem} 
            keyExtractor={(item, index) => `meal-${index}`} 
            style={styles.mealList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <ScrollView 
            style={styles.mealList}
            contentContainerStyle={styles.emptyContainer}
          >
            <Ionicons name="restaurant-outline" size={60} color="#DDD" />
            <Text style={styles.emptyText}>
              No meals planned for this day
            </Text>
            <TouchableOpacity 
              style={styles.addMealButton}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.addMealButtonText}>Add Meal</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
        
        <TouchableOpacity 
          style={styles.fab}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B00",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 4,
  },
  nutritionSummary: {
    paddingHorizontal: 16,
  },
  calorieProgress: {
    alignItems: 'center',
    marginBottom: 10,
  },
  calorieProgressInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  calorieText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  calorieLabel: {
    fontSize: 14,
    color: '#888',
    marginLeft: 4,
    marginBottom: 3,
  },
  calorieProgressBar: {
    height: 6,
    width: '100%',
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginBottom: 4,
  },
  calorieProgressFill: {
    height: 6,
    backgroundColor: '#FF6B00',
    borderRadius: 3,
  },
  calorieGoal: {
    fontSize: 12,
    color: '#888',
  },
  macroSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  macroSummaryItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  macroLabel: {
    fontSize: 12,
    color: '#888',
  },
  dayList: {
    backgroundColor: "#FFF",
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dayListContent: {
    paddingHorizontal: 12,
  },
  dayItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    minWidth: 70,
  },
  selectedDayItem: {
    backgroundColor: "#FF6B00",
  },
  todayItem: {
    borderWidth: 1,
    borderColor: "#FF6B00",
    backgroundColor: "#FFF",
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF6B00",
    position: 'absolute',
    top: 6,
    right: 6,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  selectedDayText: {
    color: "#FFF",
  },
  todayText: {
    color: "#FF6B00",
  },
  mealList: {
    flex: 1,
  },
  mealCard: {
    backgroundColor: "#FFF",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  mealIconContainer: {
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  mealTitleContainer: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  mealCalories: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  mealActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealDescription: {
    color: "#777",
    marginBottom: 12,
  },
  recipeContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  recipeContainerCollapsed: {
    maxHeight: 100,
  },
  recipeImage: {
    width: 100,
    height: 100,
  },
  recipeImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  recipeDetails: {
    flex: 1,
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  nutritionBar: {
    height: 6,
    flexDirection: "row",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  nutritionSegment: {
    height: 6,
  },
  macroContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  macroText: {
    fontSize: 12,
    color: "#666",
  },
  ingredientsList: {
    marginBottom: 12,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  ingredientBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FF6B00",
    marginTop: 6,
    marginRight: 6,
  },
  ingredientItem: {
    color: "#555",
    fontSize: 13,
    flex: 1,
  },
  moreIngredientsText: {
    color: "#888",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
  },
  viewRecipeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  viewRecipeText: {
    color: "#555",
    fontSize: 13,
    fontWeight: "500",
    marginRight: 4,
  },
  mealFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  addFoodButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addFoodText: {
    fontWeight: "600",
    marginLeft: 4,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  trackButtonText: {
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 4,
  },
  alternativesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 8,
  },
  alternativesCount: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#777",
    fontSize: 16,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: "#777",
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  addMealButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B00",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  addMealButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 6,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF6B00",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});

export default MealPlanScreen;