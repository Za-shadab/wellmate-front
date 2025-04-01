"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
  RefreshControl,
} from "react-native"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import { useRouter } from "expo-router"

const { width } = Dimensions.get("window")
const CARD_WIDTH = width / 2 - 24
const CARD_HEIGHT = 220

// Categories for filtering
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "low-carb", label: "Low Carb" },
  { id: "high-protein", label: "High Protein" },
]

const RecipeDiscoveryScreen = () => {
  const navigation = useNavigation()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState({})
  const router = useRouter()

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(50)).current

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  useEffect(() => {
    fetchRecipes()

    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const fetchRecipes = async (query = "popular") => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(
          query,
        )}&app_id=2de26262&app_key=b536c3e879fa6545e57c085ee3af42ee`,
      )

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      if (data.hits && Array.isArray(data.hits)) {
        setRecipes(data.hits)
      } else {
        setRecipes([])
        setError("No recipes found. Try a different search term.")
      }
    } catch (err) {
      console.error("Error fetching recipes:", err)
      setError("Failed to fetch recipes. Please check your connection and try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchRecipes(searchQuery)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchRecipes(searchQuery || "popular")
  }

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId)
    // In a real app, you might want to filter results or fetch new ones based on category
  }

  const navigateToRecipeDetail = (recipe) => {
    // navigation.navigate("RecipeDetail", { recipe })
    const route = 
        {
        pathname: "/Profile/wearablesInsights/[recipedetail]",
        params: {recipe: JSON.stringify(recipe)}
        }
    router.push(route);
  }

  const handleImageLoad = (id) => {
    setImagesLoaded((prev) => ({ ...prev, [id]: true }))
  }

  const filterRecipesByCategory = (recipes) => {
    if (selectedCategory === "all") return recipes

    return recipes.filter(({ recipe }) => {
      const { healthLabels = [], dietLabels = [], mealType = [] } = recipe

      switch (selectedCategory) {
        case "breakfast":
          return mealType.some((type) => type.toLowerCase().includes("breakfast"))
        case "lunch":
          return mealType.some((type) => type.toLowerCase().includes("lunch"))
        case "dinner":
          return mealType.some((type) => type.toLowerCase().includes("dinner"))
        case "vegetarian":
          return healthLabels.includes("Vegetarian")
        case "vegan":
          return healthLabels.includes("Vegan")
        case "low-carb":
          return dietLabels.includes("Low-Carb")
        case "high-protein":
          return dietLabels.includes("High-Protein")
        default:
          return true
      }
    })
  }

  const filteredRecipes = filterRecipesByCategory(recipes)

  const renderRecipeCard = ({ item, index }) => {
    const recipe = item.recipe
    const isEven = index % 2 === 0

    // Get primary diet or health label
    const primaryLabel =
      recipe.dietLabels && recipe.dietLabels.length > 0
        ? recipe.dietLabels[0]
        : recipe.healthLabels && recipe.healthLabels.includes("Vegetarian")
          ? "Vegetarian"
          : recipe.healthLabels && recipe.healthLabels.includes("Vegan")
            ? "Vegan"
            : null

    // Calculate calories per serving
    const caloriesPerServing = recipe.yield ? Math.round(recipe.calories / recipe.yield) : Math.round(recipe.calories)

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          isEven ? { marginRight: 8 } : { marginLeft: 8 },
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50 + index * 10, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => navigateToRecipeDetail(recipe)}>
          <View style={styles.imageContainer}>
            {!imagesLoaded[`recipe-${index}`] && (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="food" size={32} color="#ddd" />
              </View>
            )}
            <Image
              source={{
                uri: recipe.image,
                headers: {
                  Accept: "image/*",
                  "Cache-Control": "max-age=3600",
                },
              }}
              style={[styles.cardImage, imagesLoaded[`recipe-${index}`] ? styles.imageLoaded : styles.imageHidden]}
              resizeMode="cover"
              onLoad={() => handleImageLoad(`recipe-${index}`)}
              onError={() => console.log(`Failed to load image for ${recipe.label}`)}
            />
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.cardGradient} />
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {recipe.label}
            </Text>
            <View style={styles.cardMeta}>
              <View style={styles.cardMetaItem}>
                <Feather name="clock" size={12} color="#fff" />
                <Text style={styles.cardMetaText}>{recipe.totalTime > 0 ? `${recipe.totalTime} min` : "N/A"}</Text>
              </View>
              <View style={styles.cardMetaItem}>
                <Feather name="users" size={12} color="#fff" />
                <Text style={styles.cardMetaText}>{recipe.yield ? `${recipe.yield} serv` : "1 serv"}</Text>
              </View>
            </View>
          </View>

          {primaryLabel && (
            <View style={styles.dietLabel}>
              <Text style={styles.dietLabelText}>{primaryLabel}</Text>
            </View>
          )}

          {/* Calories badge */}
          <View style={styles.caloriesBadge}>
            <Text style={styles.caloriesBadgeText}>{caloriesPerServing} cal</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryItem, selectedCategory === item.id && styles.categoryItemSelected]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text style={[styles.categoryText, selectedCategory === item.id && styles.categoryTextSelected]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons name="food-off" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No recipes found</Text>
      <Text style={styles.emptyStateSubtitle}>Try searching for something else or check your connection</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => fetchRecipes("popular")}>
        <Text style={styles.retryButtonText}>Browse Popular Recipes</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Animated Header Background */}
      {Platform.OS === "ios" ? (
        <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]}>
          <BlurView intensity={90} style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : (
        <Animated.View style={[styles.headerBackground, { opacity: headerOpacity, backgroundColor: "#fff" }]} />
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Find delicious recipes</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}>
          <Feather name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <Feather name="x" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Recipe Grid */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Finding recipes...</Text>
        </View>
      ) : error && filteredRecipes.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item, index) => `recipe-${index}`}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.recipeGrid}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#4CAF50"]}
              tintColor="#4CAF50"
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 100,
    zIndex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 10,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    zIndex: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBarFocused: {
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
    zIndex: 2,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryItemSelected: {
    backgroundColor: "#4CAF50",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  categoryTextSelected: {
    color: "#fff",
  },
  recipeGrid: {
    padding: 16,
    paddingBottom: 40,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    height: CARD_HEIGHT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
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
  cardImage: {
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
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
    zIndex: 3,
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    zIndex: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  cardMetaText: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 4,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dietLabel: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 5,
  },
  dietLabelText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
  },
  caloriesBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(76, 175, 80, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 5,
  },
  caloriesBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
})

export default RecipeDiscoveryScreen