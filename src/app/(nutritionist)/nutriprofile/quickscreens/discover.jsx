"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { useRouter } from "expo-router"

const { width } = Dimensions.get("window")
const CARD_WIDTH = width / 2 - 24
const CARD_HEIGHT = 220

// Sample categories for filter
const CATEGORIES = ["All", "Breakfast", "Lunch", "Dinner", "Vegetarian", "Vegan", "Low-Carb", "High-Protein"]

const DiscoverScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const router = useRouter();


  const scrollY = useRef(new Animated.Value(0)).current
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  // Animation values for the entire list
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(50)).current

  useEffect(() => {
    fetchRecipes()

    // Start entrance animation when component mounts
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

  const fetchRecipes = async () => {
    setLoading(true)
    try {

      const query = searchQuery || "Whole bread"
      const response = await fetch(
        `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(
          query,
        )}&app_id=2de26262&app_key=b536c3e879fa6545e57c085ee3af42ee`,
      )
      const data = await response.json()
      setRecipes(data.hits)
      setLoading(false)
    } catch (err) {
      setError("Failed to fetch recipes. Please try again.")
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchRecipes()
  }

  const navigateToRecipeDetail = (recipes) => {
    const route = {
      pathname: "/nutriprofile/quickscreens/recipesearch/[recipeDetail]",
      params: {recipe: JSON.stringify(recipes)}
    };
    // console.log("Navigating to:", route);
    router.push(route);
  }

  const renderRecipeCard = ({ item, index }) => {
    const recipe = item.recipe
    const isEven = index % 2 === 0

    // Get primary diet or health label
    const primaryLabel =
      recipe.dietLabels && recipe.dietLabels.length > 0
        ? recipe.dietLabels[0]
        : recipe.healthLabels && recipe.healthLabels.length > 0
          ? recipe.healthLabels[0]
          : null

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          isEven ? { marginRight: 8 } : { marginLeft: 8 },
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: translateY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 50 + index * 10],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => navigateToRecipeDetail(recipe)}>
          <Image source={{ uri: recipe.image }} style={styles.cardImage} resizeMode="cover" />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.cardGradient} />
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
                <Text style={styles.cardMetaText}>{recipe.yield} serv</Text>
              </View>
            </View>
          </View>
          {primaryLabel && (
            <View style={styles.dietLabel}>
              <Text style={styles.dietLabelText}>{primaryLabel}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryItem, selectedCategory === item && styles.categoryItemSelected]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[styles.categoryText, selectedCategory === item && styles.categoryTextSelected]}>{item}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Animated Header Background */}
      {Platform.OS === "ios" ? (
        <Animated.View style={[styles.headerBackground, { opacity: headerOpacity, top: insets.top }]}>
          <BlurView intensity={90} style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : (
        <Animated.View
          style={[styles.headerBackground, { opacity: headerOpacity, top: insets.top, backgroundColor: "#fff" }]}
        />
      )}

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
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
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Recipe Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loadingText}>Finding recipes...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={40} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRecipes}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          data={recipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item, index) => `recipe-${index}`}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.recipeGrid}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
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
    height: 100,
    zIndex: 1,
  },
  header: {
    paddingHorizontal: 20,
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
    borderColor: "#ddd",
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
    backgroundColor: "#333",
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
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
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
  },
  dietLabel: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  dietLabelText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
})

export default DiscoverScreen