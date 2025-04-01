"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import axios from "axios"
import { URL } from "../../../constants/url"
import { useClientUserContext } from "../../context/ClientUserContext"
import { Feather, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

const { width, height } = Dimensions.get("window")

const AlternativeMealsScreen = () => {
  const router = useRouter()
  const { mealId, clientId } = useLocalSearchParams() // Extract dynamic route params
  const [loading, setLoading] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const [meal, setMeal] = useState(null)
  const [alternatives, setAlternatives] = useState([])
  const { clientUser } = useClientUserContext()
  const [imagesLoaded, setImagesLoaded] = useState({})

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  // Fetch meal and alternatives when the screen loads
  useEffect(() => {
    const fetchMealData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${URL}/api/mealplan/${clientId}`)
        const mealPlan = response.data.mealPlan

        // Find the specific meal using mealId
        const selectedMeal = mealPlan.meals.find((m) => m.recipe.id === mealId)

        if (selectedMeal) {
          setMeal(selectedMeal)
          setAlternatives(selectedMeal.alternateRecipes || [])

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
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
          ]).start()
        } else {
          Alert.alert("Error", "Meal not found.")
          router.back()
        }
      } catch (error) {
        console.error("Error fetching meal data:", error.response?.data || error.message)
        Alert.alert("Error", "Failed to fetch meal data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (mealId && clientId) {
      fetchMealData()
    }
  }, [mealId, clientId])

  // Handle swapping the meal
  const handleSwapMeal = async (newRecipe) => {
    try {
      setSwapping(true)
      const response = await axios.post(`${URL}/uploadPlan/swap-meal`, {
        userId: clientUser.clientId,
        oldRecipeId: meal.recipe.id,
        newRecipeId: newRecipe.id,
        mealType: meal.mealType,
        newRecipe: {
          id: newRecipe.id,
          label: newRecipe.label,
          image: newRecipe.image,
          calories: newRecipe.calories,
          serving: newRecipe.serving,
          ingredientsLines: newRecipe.ingredientsLines || [],
          nutrients: newRecipe.nutrients || [],
          url: newRecipe.url,
          cautions: newRecipe.cautions || [],
        },
        nutritionistId: clientUser.nutritionistId,
      })

      if (response.data.success) {
        Alert.alert("Success", "Meal swapped successfully!", [{ text: "OK", onPress: () => router.back() }])
      } else {
        throw new Error(response.data.message || "Failed to swap meal.")
      }
    } catch (error) {
      console.error("Error swapping meal:", error.response?.data || error.message)
      Alert.alert("Error", "Failed to swap meal. Please try again.")
    } finally {
      setSwapping(false)
    }
  }

  const handleImageLoad = (id) => {
    setImagesLoaded((prev) => ({ ...prev, [id]: true }))
  }

  // Get meal type color
  const getMealTypeColor = () => {
    if (!meal) return "#5b6af0"

    const type = meal.mealType.toLowerCase()
    switch (type) {
      case "breakfast":
        return "#FF9800"
      case "lunch":
        return "#4CAF50"
      case "dinner":
        return "#3F51B5"
      case "snack":
        return "#E91E63"
      default:
        return "#5b6af0"
    }
  }

  // Format calories
  const formatCalories = (calories) => {
    return Math.round(calories)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <ActivityIndicator size="large" color={getMealTypeColor()} />
        <Text style={styles.loadingText}>Loading alternative meals...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Alternative Meals</Text>
          {meal && <Text style={[styles.headerSubtitle, { color: getMealTypeColor() }]}>{meal.mealType}</Text>}
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Current Meal Card */}
      {meal && (
        <Animated.View
          style={[
            styles.currentMealCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              borderColor: `${getMealTypeColor()}30`,
            },
          ]}
        >
          <Text style={styles.currentMealLabel}>Current Meal</Text>

          <View style={styles.currentMealContent}>
            <View style={styles.mealImageContainer}>
              {!imagesLoaded["current-meal"] && (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons name="food" size={32} color="#ddd" />
                </View>
              )}
              <Image
                source={{ uri: meal.recipe.image }}
                style={[
                  styles.currentMealImage,
                  imagesLoaded["current-meal"] ? styles.imageLoaded : styles.imageHidden,
                ]}
                onLoad={() => handleImageLoad("current-meal")}
              />
            </View>

            <View style={styles.currentMealInfo}>
              <Text style={styles.currentMealTitle} numberOfLines={2}>
                {meal.recipe.label}
              </Text>

              <View style={styles.mealMetaContainer}>
                <View style={styles.mealMetaItem}>
                  <FontAwesome5 name="fire" size={14} color="#FF6B6B" />
                  <Text style={styles.mealMetaText}>{formatCalories(meal.recipe.calories)} cal</Text>
                </View>

                {meal.recipe.serving && (
                  <View style={styles.mealMetaItem}>
                    <MaterialCommunityIcons name="silverware-fork-knife" size={14} color="#666" />
                    <Text style={styles.mealMetaText}>{meal.recipe.serving} serving</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Alternatives Section */}
      <View style={styles.alternativesSection}>
        <Text style={styles.sectionTitle}>Choose an Alternative</Text>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {alternatives.length > 0 ? (
            alternatives.map((alt, index) => {
              // Calculate animation delay based on index
              const animationDelay = index * 100

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.alternativeCard,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateY: Animated.multiply(slideAnim, new Animated.Value(1 + index * 0.5)),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.alternativeImageContainer}>
                    {!imagesLoaded[`alt-${index}`] && (
                      <View style={styles.imagePlaceholder}>
                        <MaterialCommunityIcons name="food" size={32} color="#ddd" />
                      </View>
                    )}
                    <Image
                      source={{ uri: alt.image }}
                      style={[
                        styles.alternativeImage,
                        imagesLoaded[`alt-${index}`] ? styles.imageLoaded : styles.imageHidden,
                      ]}
                      onLoad={() => handleImageLoad(`alt-${index}`)}
                    />
                    <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.imageGradient} />
                    <Text style={styles.alternativeTitle} numberOfLines={2}>
                      {alt.label}
                    </Text>
                  </View>

                  <View style={styles.alternativeDetails}>
                    <View style={styles.alternativeMetaContainer}>
                      <View style={styles.alternativeMetaItem}>
                        <FontAwesome5 name="fire" size={14} color="#FF6B6B" />
                        <Text style={styles.alternativeMetaText}>{formatCalories(alt.calories)} cal</Text>
                      </View>

                      {alt.serving && (
                        <View style={styles.alternativeMetaItem}>
                          <MaterialCommunityIcons name="silverware-fork-knife" size={14} color="#666" />
                          <Text style={styles.alternativeMetaText}>{alt.serving} serving</Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[styles.swapButton, { backgroundColor: getMealTypeColor() }]}
                      onPress={() => handleSwapMeal(alt)}
                      disabled={swapping}
                      activeOpacity={0.8}
                    >
                      {swapping ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="swap-horizontal" size={18} color="#fff" />
                          <Text style={styles.swapButtonText}>Swap Meal</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )
            })
          ) : (
            <Animated.View
              style={[
                styles.emptyStateContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <MaterialCommunityIcons name="food-off" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Alternatives Available</Text>
              <Text style={styles.emptyStateMessage}>There are no alternative meals available for this selection.</Text>
              <TouchableOpacity
                style={[styles.goBackButton, { backgroundColor: getMealTypeColor() }]}
                onPress={() => router.back()}
              >
                <Text style={styles.goBackButtonText}>Go Back</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Bottom padding */}
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: "500",
  },
  currentMealCard: {
    margin: 20,
    marginBottom: 0,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  currentMealLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  currentMealContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  imagePlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  currentMealImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageLoaded: {
    opacity: 1,
    zIndex: 2,
  },
  imageHidden: {
    opacity: 0,
    zIndex: 1,
  },
  currentMealInfo: {
    flex: 1,
    marginLeft: 16,
  },
  currentMealTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  mealMetaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  mealMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  mealMetaText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  alternativesSection: {
    flex: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  alternativeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  alternativeImageContainer: {
    height: 160,
    width: "100%",
    position: "relative",
  },
  alternativeImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
    zIndex: 3,
  },
  alternativeTitle: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    zIndex: 4,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  alternativeDetails: {
    padding: 16,
  },
  alternativeMetaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  alternativeMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  alternativeMetaText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  swapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  swapButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  goBackButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  goBackButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default AlternativeMealsScreen