import React, { useEffect, useRef, useState } from "react";
import { 
  View, Text, Image, StyleSheet, ScrollView, FlatList, 
  TouchableOpacity, Animated, Dimensions, StatusBar, 
  Platform, SafeAreaView
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AntDesign, Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 300;
const HEADER_MIN_HEIGHT = 90;

const MealDetailScreen = () => {
  const params = useLocalSearchParams();
  console.log("params:", JSON.stringify(params))
  const router = useRouter();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeSection, setActiveSection] = useState('ingredients');
  const scrollY = useRef(new Animated.Value(0)).current;
  // Animation for heart icon
  const heartSize = useRef(new Animated.Value(1)).current;


  useEffect(() => {
    try {
      if (params.recipeUri) {
        console.log("Inside useEffect");
        const parsedData = JSON.parse(params.recipeUri);
        
        // Create the meal structure your component expects
        const mealData = {
          recipe: {
            label: parsedData.label,
            image: parsedData.image,
            ingredients: parsedData.ingredients,
            ingredientsLines: parsedData.ingredientsLines,
            nutrients: parsedData.nutrients,
            cautions: parsedData.cautions || []
          },
          mealType: "Breakfast" // Default or derive from data if available
        };
        
        setMeal(mealData);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error parsing meal detail:", error, "Raw data:", params.recipeUri);
    }
  }, [params.recipeUri]);

  // If still loading or no meal, show a loading state
  if (loading || !meal) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading meal details...</Text>
      </SafeAreaView>
    );
  }
  
  // Animated values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });
  
  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });
  
  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });
  
  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const roundValue = (value) => (value > 0 ? Math.round(value * 10) / 10 : 0);
  
  // Safely extract nutrient values
  const macros = {
    calories: meal.recipe.nutrients?.find((n) => n.label === "Energy")?.value || 0,
    protein: meal.recipe.nutrients?.find((n) => n.label === "Protein")?.value || 0,
    carbs: meal.recipe.nutrients?.find((n) => n.label === "Carbs")?.value || 0,
    fat: meal.recipe.nutrients?.find((n) => n.label === "Fat")?.value || 0,
  };

  
  const toggleFavorite = () => {
    Animated.sequence([
      Animated.timing(heartSize, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartSize, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    setIsFavorite(!isFavorite);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.Image 
          source={{ uri: meal.recipe.image }} 
          style={[
            styles.headerImage,
            { opacity: imageOpacity }
          ]} 
        />
        
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.headerGradient}
        />
        
        {/* Buttons */}
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <AntDesign name="arrowleft" size={22} color="white" />
          </TouchableOpacity>
          
          <Animated.View style={{ transform: [{ scale: heartSize }] }}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={toggleFavorite}
              activeOpacity={0.8}
            >
              <AntDesign 
                name={isFavorite ? "heart" : "hearto"} 
                size={22} 
                color={isFavorite ? "#FF5252" : "white"} 
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        {/* Title on Header */}
        <Animated.View 
          style={[
            styles.headerTitleContainer,
            {
              transform: [
                { scale: titleScale },
                { translateY: titleTranslateY }
              ]
            }
          ]}
        >
          <Text style={styles.headerTitle} numberOfLines={2}>
            {meal.recipe.label}
          </Text>
          <View style={styles.mealTypeContainer}>
            <Text style={styles.mealTypeText}>
              {meal.mealType?.charAt(0).toUpperCase() + meal.mealType?.slice(1)}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
      
      {/* Main Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Macro Card */}
        <View style={styles.macroCard}>
          <View style={styles.macroItem}>
            <View style={[styles.macroIconContainer, { backgroundColor: '#FFECEB' }]}>
              <Feather name="zap" size={20} color="#FF5252" />
            </View>
            <Text style={styles.macroValue}>{roundValue(macros.calories)}</Text>
            <Text style={styles.macroLabel}>Calories</Text>
          </View>
          
          <View style={styles.macroItem}>
            <View style={[styles.macroIconContainer, { backgroundColor: '#EEF7FF' }]}>
              <MaterialCommunityIcons name="food-steak" size={20} color="#2196F3" />
            </View>
            <Text style={styles.macroValue}>{roundValue(macros.protein)}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          
          <View style={styles.macroItem}>
            <View style={[styles.macroIconContainer, { backgroundColor: '#FFF4E3' }]}>
              <MaterialCommunityIcons name="bread-slice" size={20} color="#FF9800" />
            </View>
            <Text style={styles.macroValue}>{roundValue(macros.carbs)}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          
          <View style={styles.macroItem}>
            <View style={[styles.macroIconContainer, { backgroundColor: '#F0F4FB' }]}>
              <MaterialCommunityIcons name="oil" size={20} color="#607D8B" />
            </View>
            <Text style={styles.macroValue}>{roundValue(macros.fat)}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>
        
        {/* Section Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeSection === 'ingredients' && styles.activeTab
            ]}
            onPress={() => setActiveSection('ingredients')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText, 
              activeSection === 'ingredients' && styles.activeTabText
            ]}>
              Ingredients
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeSection === 'allergens' && styles.activeTab
            ]}
            onPress={() => setActiveSection('allergens')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText, 
              activeSection === 'allergens' && styles.activeTabText
            ]}>
              Allergens
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Content based on active tab */}
        {activeSection === 'ingredients' && (
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>
              {meal.recipe.ingredients?.length || 0} Ingredients
            </Text>
            
            {meal.recipe.ingredientsLines && (
              <Text style={styles.ingredientLinesText}>
                {meal.recipe.ingredientsLines}
              </Text>
            )}
            
            <FlatList
              data={meal.recipe.ingredients || []}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ingredientsList}
              keyExtractor={(item, index) => `ingredient-${index}`}
              renderItem={({ item, index }) => (
                <Animated.View style={styles.ingredientCard}>
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.ingredientImage} 
                  />
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.ingredientName} numberOfLines={2}>
                      {item.food}
                    </Text>
                    {item.quantity && (
                      <Text style={styles.ingredientQuantity}>
                        {roundValue(item.quantity)}
                        {item.measure ? ` ${item.measure}` : ''}
                      </Text>
                    )}
                  </View>
                </Animated.View>
              )}
            />
          </View>
        )}
        
        {activeSection === 'allergens' && (
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>Cautions / Allergens</Text>
            
            {meal.recipe.cautions && meal.recipe.cautions.length > 0 ? (
              <View style={styles.allergensList}>
                {meal.recipe.cautions.map((caution, index) => (
                  <View key={`caution-${index}`} style={styles.allergenItem}>
                    <Ionicons name="warning-outline" size={18} color="#FF9800" />
                    <Text style={styles.allergenText}>{caution}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.safeContainer}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
                <Text style={styles.safeText}>No specific allergens mentioned</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Cooking Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preparation</Text>
          <TouchableOpacity 
            style={styles.instructionsButton}
            activeOpacity={0.9}
            onPress={() => {
              // Handle viewing full recipe/instructions
              console.log("View full recipe");
            }}
          >
            <Text style={styles.instructionsButtonText}>View Full Recipe</Text>
            <AntDesign name="arrowright" size={18} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 10,
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 100,
    zIndex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 2,
  },
  headerTitleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  mealTypeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 50,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  mealTypeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT,
    paddingBottom: 30,
  },
  macroCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  macroItem: {
    alignItems: 'center',
  },
  macroIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  macroLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  activeTabText: {
    color: '#333',
  },
  section: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  ingredientLinesText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },
  ingredientsList: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  ingredientCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 120,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  ingredientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 8,
  },
  ingredientInfo: {
    alignItems: 'center',
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  ingredientQuantity: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  allergensList: {
    marginTop: 8,
  },
  allergenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  allergenText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  safeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  safeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
  },
  instructionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  instructionsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
});

export default MealDetailScreen;