import { useState, useCallback, useRef, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  Platform,
  Image,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native"
import { BlurView } from "expo-blur"
import { MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons"
import { useNutritionistDetailContext } from "../../context/NutritionistContext"
import { useFocusEffect } from "@react-navigation/native"
import axios from "axios"
import * as Haptics from "expo-haptics"
import LottieView from "lottie-react-native"
import { PieChart } from "react-native-chart-kit"
import { URL } from "../../../constants/url"
import { useRouter, useLocalSearchParams } from "expo-router"

const { width, height } = Dimensions.get("window")

export default function PlannerScreen() {
  const [selectedClient, setSelectedClient] = useState(null)
  const [plan, setPlan] = useState(null)
  const [generating, setGenerating] = useState(false)
  const { nutritionistDetail, mealPlan: contextMealPlan, setMealPlan, refreshMealPlanFlag, setRefreshMealPlanFlag } = useNutritionistDetailContext();
  const [clientsList, setClientsList] = useState([])    
  const [showPicker, setShowPicker] = useState(false)
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [activeMacro, setActiveMacro] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  console.log("refresh token", refreshMealPlanFlag);
  console.log("Nutritionist ID:", nutritionistDetail)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const spinAnim = useRef(new Animated.Value(0)).current
  const loadingProgressAnim = useRef(new Animated.Value(0)).current
  const metricsAnim = useRef(new Animated.Value(0)).current
  const successScaleAnim = useRef(new Animated.Value(0.3)).current
  const chartRotateAnim = useRef(new Animated.Value(0)).current
  const chartScaleAnim = useRef(new Animated.Value(0.8)).current
  const segmentAnim = useRef(new Animated.Value(0)).current


  // Lottie animation ref
  const lottieRef = useRef(null)
  const successLottieRef = useRef(null)

  // Scroll ref for programmatic scrolling
  const scrollViewRef = useRef(null)

  // Spin animation for loading icon
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  // Chart rotation animation
  const chartRotation = chartRotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "180deg", "360deg"],
  })

  // Simulate loading progress
  useEffect(() => {
    if (generating) {
      // Start spinning animation
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      
      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        setLoadingProgress(progress);
        
        Animated.timing(loadingProgressAnim, {
          toValue: progress,
          duration: 300,
          useNativeDriver: false,
        }).start();
        
        if (progress === 100) clearInterval(interval);
      }, 600);
      
      return () => clearInterval(interval);
    } else {
      // When plan is generated, animate the metrics
      if (plan) {
        Animated.sequence([
          Animated.timing(metricsAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(chartScaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(segmentAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(chartRotateAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [generating, plan]);

  const fetchMealPlan = useCallback(async () => {
    if (!selectedClient) return;
    if (!selectedClient?.clientUserId || !nutritionistDetail?.userId) {
      console.log('Missing required data:', {
        clientId: selectedClient?.clientUserId,
        nutritionistId: nutritionistDetail?.nutritionistId
      });
      return;
    }
    console.log("Fetching meal plan for client:", selectedClient.clientUserId);
    setLoading(true);
    try {
      const response = await axios.get(`${URL}/uploadPlan/fetch-mealplans`, {
        params: {
          userId: selectedClient.clientUserId,
          nutritionistId: nutritionistDetail.nutritionistId
        }
      });
      console.log("Response:", response.data);
      
      if (response.data.success) {
        console.log("Successfully fetched meal plan data");
        
        const newPlanData = response.data.mealPlan;
        
        // Check if data actually changed
        const currentMeals = plan?.meals?.map(m => m.recipe?.id).join(',') || '';
        const newMeals = newPlanData?.meals?.map(m => m.recipe?.id).join(',') || '';
        
        console.log("Current meals:", currentMeals);
        console.log("New meals:", newMeals);
        console.log("Data changed:", currentMeals !== newMeals);
        
        // Update both states with the new data
        setPlan({
          ...responseData,
          meals: response.data.mealPlan.meals
        });
        setMealPlan({
          ...responseData,
          meals: newPlanData
        }); // Update context state as well
        
        console.log("Meal plan state updated with new data");
        
        // Force a re-render right away instead of in a timeout
        forceUpdate();
      }
    } catch (error) {
      console.error("Error fetching meal plan:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        "Failed to fetch meal plan. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedClient, nutritionistDetail, responseData, forceUpdate]);
  
  // Add a forceUpdate function to your component
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);

  // useEffect(() => {
  //   fetchMealPlan();
  // }, [fetchMealPlan]);

  // Update the useFocusEffect to use the new refreshMealPlan function
  useFocusEffect(
    useCallback(() => {
      // Reset animations when screen comes into focus
      fadeAnim.setValue(0)
      slideAnim.setValue(30)

      // Start entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start()

      console.log("Focus effect running, refresh flag:", refreshMealPlanFlag);
      if (refreshMealPlanFlag && selectedClient) {
        console.log("Refreshing meal plan from context flag");
        fetchMealPlan();
        // Reset the flag after use
        setRefreshMealPlanFlag(false);
      }


      getclients()
    }, [selectedClient, refreshMealPlanFlag, fetchMealPlan]),
  )

  const getclients = async () => {
    try {
      const response = await axios.post(`${URL}/create/get-clientProfile`, {
        NutritionistId: nutritionistDetail.nutritionistId,
      })

      const { clientUsers, clientUsersProfile } = response.data

      const clientsres = clientUsers.map((client, index) => {
        return {
          id: client._id,
          userId: clientUsersProfile[index]?._id,
          name: client.name,
          email: client.email,
          plan: "sample",
          profileimg: require("../../../../assets/images/Frame__1_-removebg-preview.png"),
          goals: clientUsersProfile[index]?.goals || "No goals set",
          age: clientUsersProfile[index]?.age || "",
        }
      })

      setClientsList(clientsres)
    } catch (error) {
      console.log("Error fetching clients:", error)
    }
  }

  const clients = clientsList.map((client) => {
    return {
      id: client.id,
      clientUserId: client.userId,
      name: client.name,
      age: client.age,
      goal: client.goals,
    }
  })

  const generatePlan = async () => {
    if (!selectedClient) {
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert("Selection Required", "Please select a client first", [{ text: "OK" }]);
      return;
    }
  
    setGenerating(true);
    setLoadingProgress(0);
  
    try {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
  
      const response = await axios.post(`${URL}/generate/meals`, {
        userId: selectedClient.clientUserId,
        nutritionistId: nutritionistDetail.nutritionistId,
        dietaryPreferences: [],
        healthLabels: []
      });
  
      // Stop loading animation
      spinAnim.stopAnimation();
      setGenerating(false);
  
      if (response.data.success) {
        // Trigger success haptic
        if (Platform.OS === "ios") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        setResponseData(response.data)
        setPlan({
          ...response.data,
          meals: response.data.mealPlan.meals
        });
  
      } else {
        throw new Error(response.data.message || 'Failed to generate meal plan');
      }
    } catch (error) {
      spinAnim.stopAnimation();
      setGenerating(false);
  
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
  
      console.error("Error generating plan:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        "Failed to generate plan. Please try again.",
        [{ text: "OK" }]
      );
    }
  };
  
  const sendPlan = async () => {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
  
      const optimizedPlan = {
        meals: plan.meals.map(meal => ({
          mealType: meal.mealType,
          recipe: {
            id: meal.recipe.id,
            label: meal.recipe.label,
            image: meal.recipe.image,
            calories: meal.recipe.calories,
            serving: meal.recipe.serving,
            ingredientsLines: meal.recipe.ingredientsLines,
            nutrients: meal.recipe.nutrients
          }
        })),
        userProfile: {
          macros: plan.userProfile.macros,
          goalCalories: plan.userProfile.goalCalories
        },
        startDate,
        endDate
      };
  
      const response = await axios.post(`${URL}/client/send-plan`, {
        NutritionistId: nutritionistDetail.nutritionistId,
        ClientId: selectedClient.clientUserId,
        plan: optimizedPlan
      });
  
      if (response.data.success) {
        // Show success modal
        setShowSuccessModal(true);
        
        // Animate success modal
        Animated.spring(successScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }).start();
  
        // Play success animation
        if (successLottieRef.current) {
          successLottieRef.current.play();
        }
  
        // Success haptic feedback
        if (Platform.OS === "ios") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
  
        // Hide modal after animation
        setTimeout(() => {
          setShowSuccessModal(false);
          successScaleAnim.setValue(0.3);
        }, 2500);
      }
    } catch (error) {
      console.error('Error sending plan:', error.response?.data || error.message);
      Alert.alert(
        "Error",
        "Failed to send meal plan. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };
  

  const handleClientSelect = (itemValue) => {
    // Trigger light haptic feedback
    if (Platform.OS === "ios") {
      Haptics.selectionAsync()
    }

    setSelectedClient(clients.find((client) => client.id === itemValue))
    setShowPicker(false)
  }

  const showAlternativesModal = (meal) => {
    setSelectedMeal(meal)
    setShowAlternatives(true)

    // Trigger haptic feedback
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const handleMacroPress = (macro) => {
    // Trigger haptic feedback
    if (Platform.OS === "ios") {
      Haptics.selectionAsync()
    }

    setActiveMacro(activeMacro === macro ? null : macro)
  }

  // Prepare chart data if plan exists
  const chartData = plan
    ? [
        {
          name: "Protein",
          population: Number(plan.userProfile.macros.protein),
          color: "#FF6384",
          legendFontColor: "#7F7F7F",
          legendFontSize: 12,
        },
        {
          name: "Carbs",
          population: Number(plan.userProfile.macros.carbs),
          color: "#36A2EB",
          legendFontColor: "#7F7F7F",
          legendFontSize: 12,
        },
        {
          name: "Fats",
          population: Number(plan.userProfile.macros.fats),
          color: "#FFCE56",
          legendFontColor: "#7F7F7F",
          legendFontSize: 12,
        },
      ]
    : []

  // Calculate percentages for macros if plan exists
  const macroPercentages = plan
    ? {
        protein: Math.round(
          (plan.userProfile.macros.protein /
            (plan.userProfile.macros.protein + plan.userProfile.macros.carbs + plan.userProfile.macros.fats)) *
            100,
        ),
        carbs: Math.round(
          (plan.userProfile.macros.carbs /
            (plan.userProfile.macros.protein + plan.userProfile.macros.carbs + plan.userProfile.macros.fats)) *
            100,
        ),
        fats: Math.round(
          (plan.userProfile.macros.fats /
            (plan.userProfile.macros.protein + plan.userProfile.macros.carbs + plan.userProfile.macros.fats)) *
            100,
        ),
      }
    : { protein: 0, carbs: 0, fats: 0 }

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Enhanced Header */}
      <View style={styles.enhancedHeader}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerSubtitle}>Nutritionist Dashboard</Text>
            <Text style={styles.heading}>Meal Planner</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
              <Feather name="bell" size={22} color="#333" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
              <Feather name="settings" size={22} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        {/* Improved Client Selection */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <MaterialCommunityIcons name="account-group" size={18} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Client Selection</Text>
          </View>

          <TouchableOpacity
            style={styles.improvedClientSelector}
            onPress={() => {
              setShowPicker(true);
              if (Platform.OS === "ios") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            activeOpacity={0.7}
          >
            {selectedClient ? (
              <View style={styles.selectedClientContainer}>
                <View style={styles.clientAvatarSmall}>
                  <Text style={styles.clientAvatarTextSmall}>{selectedClient.name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.selectedClientName}>{selectedClient.name}</Text>
                  <Text style={styles.selectedClientGoal}>{clients.find((c) => c.id === selectedClient.id)?.goal}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Feather name="user-plus" size={20} color="#777" />
                <Text style={styles.clientSelectorPlaceholder}>Select a client</Text>
              </View>
            )}
            <View style={styles.selectorIconContainer}>
              <Feather name="chevron-down" size={20} color="#777" />
            </View>
          </TouchableOpacity>

          {selectedClient && (
            <Animated.View
              style={[
                styles.clientCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.clientCardHeader}>
                <View style={styles.clientAvatar}>
                  <Text style={styles.clientAvatarText}>{selectedClient.name.charAt(0)}</Text>
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{selectedClient.name}</Text>
                  <Text style={styles.clientGoal}>{clients.find((c) => c.id === selectedClient.id)?.goal}</Text>
                </View>
              </View>

              <View style={styles.clientStats}>
                <View style={styles.clientStat}>
                  <Text style={styles.clientStatValue}>
                    {clients.find((c) => c.id === selectedClient.id)?.age || "N/A"}
                  </Text>
                  <Text style={styles.clientStatLabel}>Age</Text>
                </View>
                <View style={styles.clientStatDivider} />
                <View style={styles.clientStat}>
                  <Text style={styles.clientStatValue}>0</Text>
                  <Text style={styles.clientStatLabel}>Plans</Text>
                </View>
                <View style={styles.clientStatDivider} />
                <View style={styles.clientStat}>
                  <Text style={styles.clientStatValue}>Active</Text>
                  <Text style={styles.clientStatLabel}>Status</Text>
                </View>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* Generate Plan Button */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.generateButton, generating && styles.generatingButton]}
            onPress={generatePlan}
            disabled={generating}
            activeOpacity={0.8}
          >
            {generating ? (
              <View style={styles.generatingContent}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Feather name="loader" size={20} color="#FFF" />
                </Animated.View>
                <Text style={styles.generateButtonText}>Generating Plan...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Feather name="zap" size={20} color="#FFF" />
                <Text style={styles.generateButtonText}>Generate Meal Plan</Text>
              </View>
            )}
          </TouchableOpacity>

          {generating && (
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: `${loadingProgress}%`,
                  },
                ]}
              />
              <Text style={styles.progressText}>{Math.round(loadingProgress)}%</Text>
            </View>
          )}
        </Animated.View>

        {/* Enhanced Nutrition Plan with Improved Pie Chart */}
        {plan && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: "#4CAF50" }]}>
                <Feather name="clipboard" size={18} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>Nutrition Plan</Text>
            </View>

            <View style={styles.planCard}>
              <View style={styles.planCardHeader}>
                <Text style={styles.planCardTitle}>Daily Nutrition Goals</Text>
                <TouchableOpacity style={styles.planCardAction} activeOpacity={0.7}>
                  <Feather name="edit-2" size={16} color="#777" />
                </TouchableOpacity>
              </View>

              {/* IMPROVED PIE CHART SECTION */}
              <Animated.View
                style={[
                  styles.enhancedChartContainer,
                  {
                    opacity: metricsAnim,
                    transform: [{ scale: metricsAnim }],
                  },
                ]}
              >
                <Text style={styles.macroTitle}>Macronutrient Distribution</Text>

                <View style={styles.chartRow}>
                  {/* Animated Pie Chart */}
                  <View style={styles.chartWrapper}>
                    <Animated.View
                      style={{
                        transform: [{ rotate: chartRotation }, { scale: chartScaleAnim }],
                        opacity: segmentAnim,
                      }}
                    >
                      <PieChart
                        data={chartData}
                        width={width * 0.45}
                        height={180}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute={false}
                        hasLegend={false}
                        center={[width * 0.11, 0]}
                      />
                    </Animated.View>
                    
                    {/* Center label */}
                    <View style={styles.chartCenterLabel}>
                      <Text style={styles.chartCenterValue}>{plan.userProfile.goalCalories}</Text>
                      <Text style={styles.chartCenterText}>calories</Text>
                    </View>
                  </View>

                  {/* Enhanced Legend with Progress Bars */}
                  <View style={styles.legendWrapper}>
                    <TouchableOpacity
                      style={[styles.legendItem, activeMacro === "protein" && styles.activeLegendItem]}
                      onPress={() => handleMacroPress("protein")}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.legendColor, { backgroundColor: "#FF6384" }]} />
                      <View style={styles.legendTextContainer}>
                        <View style={styles.legendHeader}>
                          <Text style={styles.legendLabel}>Protein</Text>
                          <Text style={styles.legendPercent}>{macroPercentages.protein}%</Text>
                        </View>
                        <Text style={styles.legendValue}>{plan.userProfile.macros.protein}g</Text>
                        <View style={styles.progressBarContainer}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${macroPercentages.protein}%`,
                                backgroundColor: "#FF6384",
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.legendItem, activeMacro === "carbs" && styles.activeLegendItem]}
                      onPress={() => handleMacroPress("carbs")}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.legendColor, { backgroundColor: "#36A2EB" }]} />
                      <View style={styles.legendTextContainer}>
                        <View style={styles.legendHeader}>
                          <Text style={styles.legendLabel}>Carbs</Text>
                          <Text style={styles.legendPercent}>{macroPercentages.carbs}%</Text>
                        </View>
                        <Text style={styles.legendValue}>{plan.userProfile.macros.carbs}g</Text>
                        <View style={styles.progressBarContainer}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${macroPercentages.carbs}%`,
                                backgroundColor: "#36A2EB",
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.legendItem, activeMacro === "fats" && styles.activeLegendItem]}
                      onPress={() => handleMacroPress("fats")}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.legendColor, { backgroundColor: "#FFCE56" }]} />
                      <View style={styles.legendTextContainer}>
                        <View style={styles.legendHeader}>
                          <Text style={styles.legendLabel}>Fats</Text>
                          <Text style={styles.legendPercent}>{macroPercentages.fats}%</Text>
                        </View>
                        <Text style={styles.legendValue}>{plan.userProfile.macros.fats}g</Text>
                        <View style={styles.progressBarContainer}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${macroPercentages.fats}%`,
                                backgroundColor: "#FFCE56",
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Nutrition Summary */}
                <View style={styles.nutritionSummary}>
                  <View style={styles.summaryItem}>
                    <FontAwesome5 name="fire" size={16} color="#FF6384" />
                    <Text style={styles.summaryValue}>{plan.userProfile.goalCalories}</Text>
                    <Text style={styles.summaryLabel}>Calories</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <FontAwesome5 name="weight" size={16} color="#36A2EB" />
                    <Text style={styles.summaryValue}>3</Text>
                    <Text style={styles.summaryLabel}>Meals</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <FontAwesome5 name="apple-alt" size={16} color="#4CAF50" />
                    <Text style={styles.summaryValue}>7</Text>
                    <Text style={styles.summaryLabel}>Days</Text>
                  </View>
                </View>

                {/* Macro Details (shows when a macro is selected) */}
                {activeMacro && (
                  <Animated.View style={styles.macroDetails} entering={Animated.FadeIn} exiting={Animated.FadeOut}>
                    <View style={styles.macroDetailsHeader}>
                      <Text style={styles.macroDetailsTitle}>
                        {activeMacro.charAt(0).toUpperCase() + activeMacro.slice(1)} Details
                      </Text>
                      <TouchableOpacity onPress={() => setActiveMacro(null)} activeOpacity={0.7}>
                        <Feather name="x" size={20} color="#777" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.macroDetailsContent}>
                      <View style={styles.macroDetailItem}>
                        <Text style={styles.macroDetailLabel}>Daily Goal</Text>
                        <Text style={styles.macroDetailValue}>{plan.userProfile.macros[activeMacro]}g</Text>
                      </View>

                      <View style={styles.macroDetailItem}>
                        <Text style={styles.macroDetailLabel}>Calories from {activeMacro}</Text>
                        <Text style={styles.macroDetailValue}>
                          {activeMacro === "protein" || activeMacro === "carbs"
                            ? plan.userProfile.macros[activeMacro] * 4
                            : plan.userProfile.macros[activeMacro] * 9}{" "}
                          cal
                        </Text>
                      </View>

                      <View style={styles.macroDetailItem}>
                        <Text style={styles.macroDetailLabel}>Percentage</Text>
                        <Text style={styles.macroDetailValue}>{macroPercentages[activeMacro]}%</Text>
                      </View>
                    </View>
                  </Animated.View>
                )}
              </Animated.View>
              {/* END OF IMPROVED PIE CHART SECTION */}

              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={sendPlan} 
                activeOpacity={0.8}
              >
                <Feather name="send" size={18} color="#FFF" />
                <Text style={styles.sendButtonText}>Send to Client</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Meal Plan */}
        {(plan?.meals || contextMealPlan?.meals) && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: "#FF9800" }]}>
                <Feather name="coffee" size={18} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>Meal Plan</Text>
            </View>

            {/* Group meals by meal type */}
            {(() => {
              // Use either plan.meals or mealPlan.meals
              const meals = plan?.meals || contextMealPlan?.meals || [];
              
              // Group meals by mealType
              const mealsByType = {}
              meals.forEach((meal) => {
                if (!mealsByType[meal.mealType]) {
                  mealsByType[meal.mealType] = []
                }
                mealsByType[meal.mealType].push(meal)
              })

              // Render each meal type group
              return Object.entries(mealsByType).map(([mealType, meals], groupIndex) => (
                <View key={mealType} style={styles.mealTypeGroup}>
                  <View style={styles.mealTypeHeader}>
                    <Text style={styles.mealTypeHeaderText}>{mealType}</Text>
                    <Text style={styles.mealCountBadge}>{meals.length}</Text>
                  </View>

                  {meals.map((meal, index) => (
                    <Animated.View
                      key={`${meal.recipe.id || index}-${index}`}
                      style={[styles.mealCard, index === 0 ? styles.firstMealInGroup : {}, {
                        opacity: fadeAnim,
                        transform: [{
                          translateY: slideAnim.interpolate({
                            inputRange: [0, 30],
                            outputRange: [0, 30 + (groupIndex + index) * 5],
                          }),
                        }],
                      }]}
                    >
                      <View style={styles.mealCardContent}>
                        <View style={styles.mealImageContainer}>
                          <Image
                            style={styles.mealImage}
                            resizeMode="cover"
                            source={{
                              uri: meal.recipe.image,
                            }}
                          />
                        </View>
                        <Text style={styles.mealTitle}>{meal.recipe.label}</Text>
                        <View style={styles.mealMacros}>
                          <Text style={styles.mealMacro}>
                            <Feather name="clock" size={12} color="#777" /> 30 min
                          </Text>
                          <Text style={styles.mealMacro}>
                            <Feather name="activity" size={12} color="#777" /> {Math.round(meal.recipe.calories)} cal
                          </Text>
                        </View>

                        {/* Meal Card Action Buttons */}
                        <View style={styles.mealActionButtons}>
                          <TouchableOpacity 
                            style={styles.mealActionButton}
                            activeOpacity={0.7}
                          >
                            <Feather name="plus-circle" size={16} color="#5b6af0" />
                            <Text style={styles.mealActionText}>Add Food</Text>
                          </TouchableOpacity>

                          <TouchableOpacity 
                            style={styles.mealActionButton} 
                            activeOpacity={0.7}
                            onPress={() => {
                              // Create the correct data structure
                              const mealData = {
                                currentRecipe: meal.recipe,
                                alternateRecipes: {
                                  recipes: meal.alternateRecipes || [], 
                                  mealType: meal.mealType
                                },
                                mealType: meal.mealType,
                                clientId: selectedClient.clientUserId
                              };
                              
                              if (Platform.OS === "ios") {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              }
                          
                              router.push({
                                pathname: '/planner/[alternateRecipes]',
                                params: {
                                  recipes: encodeURIComponent(JSON.stringify(mealData)),
                                  source: 'singleday'
                                }
                              });
                            }}
                          >
                            <Feather name="refresh-cw" size={16} color="#FF9800" />
                            <Text style={styles.mealActionText}>
                              Alternatives ({meal.alternateRecipes?.length || 0})
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.mealCardActions}>
                        <TouchableOpacity style={styles.mealCardAction} activeOpacity={0.7}>
                          <Feather name="eye" size={18} color="#555" />
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              ))
            })()}
          </Animated.View>
        )}
      </ScrollView>

      {/* Client Picker Modal */}
      {showPicker && (
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowPicker(false)}
        >
          <BlurView intensity={90} style={styles.blurView}>
            <Animated.View
              style={[
                styles.pickerModal,
                {
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Client</Text>
                <TouchableOpacity 
                  onPress={() => setShowPicker(false)}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.clientsList}>
                {clients.map((client) => (
                  <TouchableOpacity
                    key={client.id}
                    style={styles.clientItem}
                    onPress={() => handleClientSelect(client.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.clientItemAvatar}>
                      <Text style={styles.clientItemAvatarText}>{client.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.clientItemInfo}>
                      <Text style={styles.clientItemName}>{client.name}</Text>
                      <Text style={styles.clientItemGoal}>{client.goal}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#ccc" />
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </BlurView>
        </TouchableOpacity>
      )}

      {/* Alternatives Modal */}
      {showAlternatives && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showAlternatives}
          onRequestClose={() => setShowAlternatives(false)}
        >
          <View style={styles.alternativesModalContainer}>
            <View style={styles.alternativesModal}>
              <View style={styles.alternativesHeader}>
                <Text style={styles.alternativesTitle}>Alternative Meals</Text>
                <TouchableOpacity 
                  onPress={() => setShowAlternatives(false)}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.alternativesList}>
                {[1, 2, 3].map((item) => (
                  <View key={item} style={styles.alternativeItem}>
                    <Image
                      style={styles.alternativeImage}
                      source={{ uri: selectedMeal?.recipe.image }}
                      resizeMode="cover"
                    />
                    <View style={styles.alternativeInfo}>
                      <Text style={styles.alternativeName}>Alternative {item}</Text>
                      <Text style={styles.alternativeCalories}>
                        {Math.round(selectedMeal?.recipe.calories * (0.8 + item * 0.1))} calories
                      </Text>
                      <TouchableOpacity 
                        style={styles.selectButton}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.selectButtonText}>Select</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Success Modal with Lottie Animation */}
      {showSuccessModal && (
        <Modal
          transparent={true}
          visible={showSuccessModal}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.successModalContainer}>
            <Animated.View
              style={[
                styles.successModal,
                {
                  transform: [{ scale: successScaleAnim }],
                },
              ]}
            >
              <View style={styles.successLottieContainer}>
                <LottieView
                  ref={successLottieRef}
                  source={require("../../../../assets/animation/Animation - 1739003175068.json")}
                  style={styles.successLottie}
                  loop={false}
                  autoPlay={false}
                />
              </View>
              <Text style={styles.successTitle}>Plan Sent!</Text>
              <Text style={styles.successMessage}>
                Your meal plan has been successfully sent to {selectedClient?.name}
              </Text>
            </Animated.View>
          </View>
        </Modal>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5b6af0" />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  enhancedHeader: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#777",
    marginBottom: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6384",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#5b6af0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  improvedClientSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  selectedClientContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  clientAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#5b6af0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  clientAvatarTextSmall: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  selectedClientName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  selectedClientGoal: {
    fontSize: 13,
    color: "#777",
  },
  placeholderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  clientSelectorPlaceholder: {
    fontSize: 16,
    color: "#999",
    marginLeft: 10,
  },
  selectorIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  clientCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    overflow: "hidden",
  },
  clientCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  clientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#5b6af0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  clientAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  clientGoal: {
    fontSize: 14,
    color: "#777",
  },
  clientStats: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingVertical: 12,
  },
  clientStat: {
    flex: 1,
    alignItems: "center",
  },
  clientStatValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  clientStatLabel: {
    fontSize: 12,
    color: "#777",
  },
  clientStatDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#f0f0f0",
    alignSelf: "center",
  },
  generateButton: {
    backgroundColor: "#5b6af0",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#5b6af0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  generatingButton: {
    backgroundColor: "#5b6af0",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  generatingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#eee",
    borderRadius: 2,
    marginTop: 15,
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#5b6af0",
    borderRadius: 2,
  },
  progressText: {
    position: "absolute",
    right: 0,
    top: 8,
    fontSize: 12,
    color: "#777",
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  planCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  planCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  planCardAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  // Enhanced Chart Styles
  enhancedChartContainer: {
    marginBottom: 16,
  },
  macroTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  chartWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: width * 0.45,
    height: 180,
    paddingLeft: 0, // Add padding to prevent chart from being cut off
  },
  chartCenterLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
  chartCenterValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  chartCenterText: {
    fontSize: 12,
    color: "#777",
  },
  legendWrapper: {
    flex: 1,
    paddingLeft: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
  },
  activeLegendItem: {
    backgroundColor: "#f8f9fa",
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
    marginTop: 2,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  legendLabel: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  legendPercent: {
    fontSize: 12,
    color: "#777",
    fontWeight: "500",
  },
  legendValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#eee",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  nutritionSummary: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 6,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#777",
  },
  summaryDivider: {
    width: 1,
    height: "70%",
    backgroundColor: "#e0e0e0",
    alignSelf: "center",
  },
  macroDetails: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  macroDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  macroDetailsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  macroDetailsContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroDetailItem: {
    alignItems: "center",
    flex: 1,
  },
  macroDetailLabel: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },
  macroDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  sendButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  lottieContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: 100,
    height: 100,
  },
  mealCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    flexDirection: "row",
  },
  mealCardContent: {
    flex: 1,
    padding: 16,
  },
  mealTypeTag: {
    backgroundColor: "#f0f4ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  mealTypeText: {
    fontSize: 12,
    color: "#5b6af0",
    fontWeight: "500",
  },
  mealImageContainer: {
    height: 50,
    width: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 8,
  },
  mealImage: {
    height: 50,
    aspectRatio: 1,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  mealMacros: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  mealMacro: {
    fontSize: 12,
    color: "#777",
    marginRight: 12,
  },
  mealActionButtons: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 4,
  },
  mealActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  mealActionText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  mealCardActions: {
    borderLeftWidth: 1,
    borderLeftColor: "#f0f0f0",
    padding: 16,
    justifyContent: "center",
  },
  mealCardAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  blurView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  pickerModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  clientsList: {
    maxHeight: height * 0.5,
  },
  clientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  clientItemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5b6af0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  clientItemAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  clientItemInfo: {
    flex: 1,
  },
  clientItemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  clientItemGoal: {
    fontSize: 13,
    color: "#777",
  },
  alternativesModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alternativesModal: {
    width: width * 0.9,
    maxHeight: height * 0.7,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  alternativesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  alternativesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  alternativesList: {
    maxHeight: height * 0.5,
  },
  alternativeItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  alternativeImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  alternativeInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  alternativeName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  alternativeCalories: {
    fontSize: 14,
    color: "#777",
  },
  selectButton: {
    backgroundColor: "#5b6af0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  mealTypeGroup: {
    marginBottom: 20,
  },
  mealTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  mealTypeHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  mealCountBadge: {
    fontSize: 12,
    color: "#fff",
    backgroundColor: "#5b6af0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  firstMealInGroup: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  successModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  successModal: {
    width: width * 0.8,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  successLottieContainer: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  successLottie: {
    width: "100%",
    height: "100%",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
})