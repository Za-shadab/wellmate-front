"use client"

import React, { useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  Share,
  Linking,
  SafeAreaView,
} from "react-native"
import { Feather, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useLocalSearchParams } from "expo-router"

const { width, height } = Dimensions.get("window")

const RecipeDetailScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { recipe } = useLocalSearchParams()
  console.log("recipe Data:", recipe)

  const [activeTab, setActiveTab] = useState("ingredients")
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  // Image animations
  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: "clamp",
  })

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-100, 0, 200],
    outputRange: [0, 0, 100],
    extrapolate: "clamp",
  })

  React.useEffect(() => {
    // Start entrance animations
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
  }, [])

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe: ${recipe.label || recipe.source} - ${recipe.url}`,
        url: recipe.url,
        title: recipe.label || recipe.source,
      })
    } catch (error) {
      console.error("Error sharing recipe:", error)
    }
  }

  const openSourceWebsite = () => {
    if (recipe.url) {
      Linking.openURL(recipe.url)
    }
  }

  // Process recipe data
  const recipeData = recipe && typeof recipe === 'string' ? JSON.parse(recipe) : recipe

  // Format calories
  const calories = Math.round(recipeData?.calories || 0)
  const caloriesPerServing = recipeData?.yield ? Math.round(calories / recipeData.yield) : calories

  // Get macros
  const protein = Math.round(recipeData?.totalNutrients?.PROCNT?.quantity || 0)
  const fat = Math.round(recipeData?.totalNutrients?.FAT?.quantity || 0)
  const carbs = Math.round(recipeData?.totalNutrients?.CHOCDF?.quantity || 0)
  const fiber = Math.round(recipeData?.totalNutrients?.FIBTG?.quantity || 0)

  // Get cuisine type
  const cuisineType =
    recipeData?.cuisineType && recipeData.cuisineType.length > 0
      ? recipeData.cuisineType[0].charAt(0).toUpperCase() + recipeData.cuisineType[0].slice(1)
      : "Various"

  // Get meal type
  const mealType =
    recipeData?.mealType && recipeData.mealType.length > 0
      ? recipeData.mealType[0].charAt(0).toUpperCase() + recipeData.mealType[0].slice(1)
      : "Meal"

  // Get image URL from different places in the recipeData structure
  const getImageUrl = () => {
    if (recipeData?.image) return recipeData.image
    if (recipeData?.images?.REGULAR?.url) return recipeData.images.REGULAR.url
    if (recipeData?.images?.LARGE?.url) return recipeData.images.LARGE.url
    if (recipeData?.images?.SMALL?.url) return recipeData.images.SMALL.url
    if (recipeData?.images?.THUMBNAIL?.url) return recipeData.images.THUMBNAIL.url
    return null
  }

  const imageUrl = getImageUrl()

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Header */}
      {Platform.OS === "ios" ? (
        <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]}>
          <BlurView intensity={90} style={StyleSheet.absoluteFill} />
          <SafeAreaView style={styles.headerContent}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {recipeData?.label || "Recipe Detail"}
            </Text>
          </SafeAreaView>
        </Animated.View>
      ) : (
        <Animated.View
          style={[
            styles.headerBackground,
            {
              opacity: headerOpacity,
              backgroundColor: "#fff",
            },
          ]}
        >
          <SafeAreaView style={styles.headerContent}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {recipeData?.label || "Recipe Detail"}
            </Text>
          </SafeAreaView>
        </Animated.View>
      )}

      {/* Back Button */}
      <SafeAreaView style={styles.safeAreaTop}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BlurView intensity={80} style={styles.backButtonBlur}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </BlurView>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setIsFavorite(!isFavorite)}>
            <BlurView intensity={80} style={styles.actionButtonBlur}>
              <Feather name="heart" size={20} color={isFavorite ? "#FF5252" : "#fff"} />
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <BlurView intensity={80} style={styles.actionButtonBlur}>
              <Feather name="share" size={20} color="#fff" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      >
        {/* Recipe Image */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: [{ scale: imageScale }, { translateY: imageTranslateY }],
            },
          ]}
        >
          {!imageLoaded && (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="food" size={64} color="#ddd" />
            </View>
          )}
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.recipeImage}
              resizeMode="cover"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <View style={[styles.recipeImage, styles.noImage]}>
              <MaterialCommunityIcons name="food-variant" size={64} color="#ddd" />
              <Text style={styles.noImageText}>No Image Available</Text>
            </View>
          )}
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.imageGradient} />

          <View style={styles.imageContent}>
            <Animated.Text style={[styles.recipeTitle, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              {recipeData?.label || "Recipe Name"}
            </Animated.Text>

            <Animated.View
              style={[styles.recipeMetaContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
            >
              <View style={styles.recipeMeta}>
                <Feather name="clock" size={14} color="#fff" />
                <Text style={styles.recipeMetaText}>
                  {recipeData?.totalTime > 0 ? `${recipeData.totalTime} min` : "N/A"}
                </Text>
              </View>

              <View style={styles.recipeMeta}>
                <Feather name="users" size={14} color="#fff" />
                <Text style={styles.recipeMetaText}>
                  {recipeData?.yield ? `${recipeData.yield} servings` : "1 serving"}
                </Text>
              </View>

              <View style={styles.recipeMeta}>
                <Feather name="tag" size={14} color="#fff" />
                <Text style={styles.recipeMetaText}>{cuisineType}</Text>
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Recipe Content */}
        <View style={styles.contentContainer}>
          {/* Diet Labels */}
          {(recipeData?.dietLabels?.length > 0 || recipeData?.healthLabels?.length > 0) && (
            <Animated.View
              style={[styles.labelsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
            >
              {recipeData?.dietLabels?.map((label, index) => (
                <View key={`diet-${index}`} style={styles.labelBadge}>
                  <Text style={styles.labelText}>{label}</Text>
                </View>
              ))}
              {recipeData?.healthLabels?.slice(0, 3).map((label, index) => (
                <View key={`health-${index}`} style={[styles.labelBadge, styles.healthLabel]}>
                  <Text style={styles.labelText}>{label}</Text>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Nutrition Summary */}
          <Animated.View
            style={[styles.nutritionContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <Text style={styles.sectionTitle}>Nutrition</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{caloriesPerServing}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{protein}g</Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{fat}g</Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{carbs}g</Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
            </View>
          </Animated.View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "ingredients" && styles.activeTab]}
              onPress={() => setActiveTab("ingredients")}
            >
              <Text style={[styles.tabText, activeTab === "ingredients" && styles.activeTabText]}>Ingredients</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "instructions" && styles.activeTab]}
              onPress={() => setActiveTab("instructions")}
            >
              <Text style={[styles.tabText, activeTab === "instructions" && styles.activeTabText]}>Instructions</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === "ingredients" ? (
            <View style={styles.ingredientsContainer}>
              {recipeData?.ingredientLines?.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientBullet} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
              {(!recipeData?.ingredientLines || recipeData.ingredientLines.length === 0) && (
                <Text style={styles.noDataText}>No ingredients information available</Text>
              )}
            </View>
          ) : (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>For full instructions, visit:</Text>
              <TouchableOpacity style={styles.sourceButton} onPress={openSourceWebsite}>
                <Text style={styles.sourceButtonText}>{recipeData?.source || "Source"}</Text>
                <Feather name="external-link" size={16} color="#333" style={styles.sourceIcon} />
              </TouchableOpacity>
            </View>
          )}

          {/* Health Labels */}
          {recipeData?.healthLabels && recipeData.healthLabels.length > 0 && (
            <View style={styles.healthLabelsContainer}>
              <Text style={styles.sectionTitle}>Health Labels</Text>
              <View style={styles.healthLabelsList}>
                {recipeData.healthLabels.map((label, index) => (
                  <View key={index} style={styles.healthLabelBadge}>
                    <FontAwesome5 name="check-circle" size={12} color="#4CAF50" />
                    <Text style={styles.healthLabelText}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* CO2 Emissions */}
          {recipeData?.totalCO2Emissions && (
            <View style={styles.co2Container}>
              <Text style={styles.sectionTitle}>Environmental Impact</Text>
              <View style={styles.co2Content}>
                <MaterialCommunityIcons name="leaf" size={20} color="#4CAF50" />
                <Text style={styles.co2Text}>
                  CO2 Emissions: {Math.round(recipeData.totalCO2Emissions)} g ({recipeData.co2EmissionsClass || "N/A"})
                </Text>
              </View>
            </View>
          )}

          {/* Source */}
          <View style={styles.sourceContainer}>
            <Text style={styles.sourceText}>Recipe from {recipeData?.source || "Unknown Source"}</Text>
		<TouchableOpacity style={styles.sourceLink} onPress={openSourceWebsite}>
              <Text style={styles.sourceLinkText}>Visit website</Text>
              <Feather name="external-link" size={14} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </View>
      </Animated.ScrollView>
    </View>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  safeAreaTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 90 : 70,
    zIndex: 9,
    overflow: "hidden",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Platform.OS === "ios" ? "#000" : "#333",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.3)" : undefined,
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    marginLeft: 10,
  },
  actionButtonBlur: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.3)" : undefined,
  },
  imageContainer: {
    height: height * 0.45,
    width,
    backgroundColor: "#f0f0f0",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
  },
  noImageText: {
    marginTop: 10,
    color: "#999",
    fontSize: 16,
  },
  imagePlaceholder: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  imageContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 12,
  },
  recipeMetaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  recipeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  recipeMetaText: {
    marginLeft: 6,
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  contentContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
  },
  labelsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  labelBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  healthLabel: {
    backgroundColor: "#42a5f5",
  },
  labelText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  nutritionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nutritionItem: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF6B6B",
  },
  tabText: {
    fontSize: 16,
    color: "#888",
  },
  activeTabText: {
    fontWeight: "600",
    color: "#333",
  },
  ingredientsContainer: {
    marginBottom: 24,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF6B6B",
    marginTop: 7,
    marginRight: 10,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
  },
  instructionsContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  instructionsText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
  },
  sourceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sourceButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginRight: 6,
  },
  sourceIcon: {
    marginLeft: 6,
  },
  healthLabelsContainer: {
    marginBottom: 24,
  },
  healthLabelsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  healthLabelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  healthLabelText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#333",
  },
  co2Container: {
    marginBottom: 24,
  },
  co2Content: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  co2Text: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  sourceContainer: {
    marginBottom: 12,
    alignItems: "center",
  },
  sourceText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  sourceLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  sourceLinkText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginRight: 4,
  },
  bottomPadding: {
    height: 40,
  },
  noDataText: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
})

export default RecipeDetailScreen