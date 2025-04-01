import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  SafeAreaView,
  Alert
} from 'react-native';
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import CollectionTab from "./components/CollectionTab";
import DiscoverTab from "./components/DiscoverTab";
import axios from 'axios';
import { useNutritionistDetailContext } from "../../context/NutritionistContext";
import { URL } from "../../../constants/url";
import { useMealPlanContext } from '../../context/MealPlanContext';


const { width } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const Tab = createMaterialTopTabNavigator();

const AlternativesView = ({ alternativeRecipes, currentRecipe, mealType, openRecipeUrl, getNutrientInfo, getMealTypeColor }) => {
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(false);
  const { nutritionistDetail, setRefreshMealPlanFlag} = useNutritionistDetailContext();
  const { recipes,source } = useLocalSearchParams();
  const { setMealPlanData } = useMealPlanContext();
  
  // Parse the params to get clientId
  const parsedData = React.useMemo(() => {
    try {
      const decodedString = decodeURIComponent(recipes);
      console.log('Decoded string:', decodedString);
      return JSON.parse(decodedString);
    } catch (error) {
      console.error("Error parsing recipes data:", error);
      return {
        clientId: null,
        currentRecipe: null,
        alternateRecipes: { recipes: [] },
        mealType: ''
      };
    }
  }, [recipes]);

  // Update the handleSwapMeal function
  const handleSwapMeal = async (newRecipe) => {
    try {
      setLoading(true);
      
      if (!parsedData.clientId) {
        console.log("Client ID is missing in parsed data:", parsedData);
        throw new Error('Client ID is missing');
      }

      console.log('Swap attempt with:', {
        userId: parsedData.clientId,
        currentRecipe: currentRecipe,
        newRecipe: newRecipe,
        mealType: mealType
      });
      const userId = parsedData.clientId || savedPlanData?.userId || nutritionistDetail?.nutritionistId;
      const response = await axios.post(`${URL}/uploadPlan/swap-meal`, {
        userId: userId,
        oldRecipeId: currentRecipe.id,
        newRecipeId: newRecipe.id,
        mealType: mealType,
        newRecipe: {
          id: newRecipe.id,
          label: newRecipe.label,
          image: newRecipe.image,
          calories: newRecipe.calories,
          serving: newRecipe.serving,
          ingredientsLines: newRecipe.ingredientsLines || [],
          nutrients: newRecipe.nutrients || [],
          url: newRecipe.url,
          cautions: newRecipe.cautions || []
        },
        nutritionistId: nutritionistDetail?.nutritionistId
      });

      if (response.data.success) {
        setRefreshMealPlanFlag(true);
        Alert.alert(
          "Success",
          "Meal swapped successfully!",
          [{ text: "OK", onPress: () => {
            if (source === 'singleday') {
              router.back();
            } else if(source === 'multiday') {
              router.replace('/(nutritionist)/savedplanner/savedplans');
            }
          } }]
        );
      }
    } catch (error) {
      console.error('Swap error details:', error.response);
      Alert.alert(
        "Error",
        "Failed to swap meal. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Add toggle function
  const toggleRecipeDetails = (index) => {
    setSelectedRecipeIndex(selectedRecipeIndex === index ? null : index);
  };

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderRecipeImage = (recipe) => {
    const [imageError, setImageError] = useState(false);
    
    let imageUrl = recipe.image || 
      (recipe.images && recipe.images.REGULAR && recipe.images.REGULAR.url);
        
    if (imageUrl && !imageError) {
      // Clean up the URL - remove any double encoding
      imageUrl = decodeURIComponent(imageUrl);
      
      // Handle Edamam image URLs specifically
      if (imageUrl.includes('edamam-product-images')) {
        const [baseUrl, params] = imageUrl.split('?');
        if (params) {
          imageUrl = `${baseUrl}?${params.replace(/\+/g, '%2B')}`;
        }
      }
  
      return (
        <Image 
          source={{ 
            uri: imageUrl,
            headers: {
              'Accept': '*/*'
            },
            cache: 'force-cache'
          }} 
          style={styles.recipeImage}
          resizeMode="cover"
          onError={(e) => {
            console.log('Image load error:', e.nativeEvent.error);
            setImageError(true);
          }}
          defaultSource={require('../../../../assets/images/avocado.png')}
        />
      );
    }
  
    // Show placeholder if no image or error loading
    return (
      <View style={styles.placeholderImage}>
        <MaterialCommunityIcons name="food" size={40} color="#ccc" />
      </View>
    );
  };

  // Remove these props from Tab.Navigator children
  return (
    <AnimatedScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {!alternativeRecipes || alternativeRecipes.length === 0 ? (
        <Animated.View 
          style={[styles.emptyStateContainer, { opacity: fadeAnim }]}
        >
          <MaterialCommunityIcons name="food-off" size={80} color="#ccc" />
          <Text style={styles.noRecipes}>No alternative recipes found</Text>
          <TouchableOpacity 
            style={styles.goBackButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        // Rest of your rendering logic using selectedRecipeIndex and toggleRecipeDetails
        alternativeRecipes.map((recipe, index) => {
          if (!recipe) return null;
          
          const isSelected = selectedRecipeIndex === index;
          const nutrients = getNutrientInfo(recipe);
          
          const recipeLabel = typeof recipe.label === 'string' ? recipe.label : "Recipe Name";
          const recipeCalories = typeof recipe.calories === 'number' ? Math.round(recipe.calories) : 
                               typeof recipe.calories === 'string' ? Math.round(parseFloat(recipe.calories)) : 0;
          const recipeServing = typeof recipe.serving === 'string' || typeof recipe.serving === 'number' 
            ? recipe.serving 
            : "";
          
          return (
            <Animated.View 
              key={recipe.id || index} 
              style={[
                styles.recipeCard,
                isSelected && styles.selectedRecipeCard,
                { 
                  opacity: fadeAnim,
                  transform: [{ 
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    }) 
                  }]
                }
              ]}
            >
              <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => toggleRecipeDetails(index)}
                style={styles.recipeCardTouchable}
              >
                <View style={styles.recipeHeader}>
                  {renderRecipeImage(recipe)}
                  
                  <View style={styles.recipeTitleContainer}>
                    <Text style={styles.recipeTitle} numberOfLines={2}>
                      {recipeLabel}
                    </Text>
                    
                    <View style={styles.recipeMetaContainer}>
                      <View style={styles.calorieContainer}>
                        <FontAwesome5 name="fire" size={14} color={getMealTypeColor()} />
                        <Text style={styles.calories}>
                          {recipeCalories} calories
                        </Text>
                      </View>
                      
                      {recipeServing ? (
                        <View style={styles.servingContainer}>
                          <MaterialCommunityIcons name="silverware-fork-knife" size={14} color="#666" />
                          <Text style={styles.servingInfo}>
                            {recipeServing} serving
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  
                  <View style={[
                    styles.expandButton,
                    { backgroundColor: isSelected ? '#f0f0f0' : 'transparent' }
                  ]}>
                    <Ionicons 
                      name={isSelected ? "chevron-up" : "chevron-down"} 
                      size={24} 
                      color="#666"
                    />
                  </View>
                </View>
              </TouchableOpacity>
              
              {isSelected && (
                <Animated.View 
                  style={[
                    styles.recipeDetails,
                    { 
                      opacity: fadeAnim,
                      transform: [{ 
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0]
                        }) 
                      }]
                    }
                  ]}
                >
                  {nutrients.length > 0 && (
                    <View style={styles.nutrientsContainer}>
                      {nutrients.map((nutrient, idx) => (
                        <View key={idx} style={styles.nutrientItem}>
                          <View style={[styles.nutrientIconContainer, { backgroundColor: `${nutrient.color}20` }]}>
                            <MaterialCommunityIcons 
                              name={nutrient.icon} 
                              size={18} 
                              color={nutrient.color} 
                            />
                          </View>
                          <Text style={styles.nutrientValue}>
                            {nutrient.value}{nutrient.unit}
                          </Text>
                          <Text style={styles.nutrientName}>{nutrient.name}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {recipe.cautions && Array.isArray(recipe.cautions) && recipe.cautions.length > 0 && (
                    <View style={styles.cautionsContainer}>
                      <Text style={styles.sectionTitle}>Cautions:</Text>
                      <View style={styles.cautionsList}>
                        {recipe.cautions.map((caution, idx) => (
                          <View key={idx} style={styles.cautionTag}>
                            <Ionicons name="alert-circle" size={12} color="#c62828" />
                            <Text style={styles.cautionText}>
                              {typeof caution === 'string' ? caution : ''}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  {recipe.ingredientsLines && Array.isArray(recipe.ingredientsLines) && recipe.ingredientsLines.length > 0 && (
                    <View style={styles.ingredientsContainer}>
                      <Text style={styles.sectionTitle}>Ingredients:</Text>
                      <View style={styles.ingredientsList}>
                        {recipe.ingredientsLines.map((ingredient, idx) => (
                          <View key={idx} style={styles.ingredientItem}>
                            <View style={[styles.bulletPoint, { backgroundColor: getMealTypeColor() }]} />
                            <Text style={styles.ingredient}>
                              {typeof ingredient === 'string' ? ingredient : ''}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.viewButton, { backgroundColor: getMealTypeColor() }]}
                      onPress={() => openRecipeUrl(recipe.url)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="open-outline" size={18} color="#fff" />
                      <Text style={styles.viewButtonText}>View Full Recipe</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.saveButton]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="bookmark-outline" size={18} color="#fff" />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.actionButton, styles.swapButton]}
                      onPress={() => handleSwapMeal(recipe)}
                    >
                      <MaterialCommunityIcons name="swap-horizontal" size={18} color="#fff" />
                      <Text style={styles.swapButtonText}>Swap Meal</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
            </Animated.View>
          );
        })
      )}
    </AnimatedScrollView>
  );
};

const CollectionView = ({ mealType }) => {
  const { recipes, source } = useLocalSearchParams();
  const { nutritionistDetail,setRefreshMealPlanFlag } = useNutritionistDetailContext();
  const [loading, setLoading] = useState(false);
  console.log("Source:", source);
  
  const parsedData = React.useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(recipes));
    } catch (error) {
      console.error("Error parsing recipes data:", error);
      return {};
    }
  }, [recipes]);

  const handleSwap = async (newRecipe) => {
    try {
      setLoading(true);
      const response = await axios.post(`${URL}/uploadPlan/swap-meal`, {
        userId: parsedData.clientId,
        oldRecipeId: parsedData.currentRecipe.id,
        newRecipeId: newRecipe.id,
        mealType: mealType,
        newRecipe: newRecipe,
        nutritionistId: nutritionistDetail.nutritionistId
      });

      if (response.data.success) {
        setRefreshMealPlanFlag(true);
        Alert.alert(
          "Success",
          "Meal swapped successfully!",
          [{ text: "OK", onPress: () => {
            if (source === 'singleday') {
              router.back();
            } else if(source === 'multiday') {
              router.replace('/(nutritionist)/savedplanner/savedplans');
            }
          } }]
        );
      }
    } catch (error) {
      console.error('Swap error:', error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to swap meal. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CollectionTab 
        mealType={mealType} 
        onSwap={handleSwap}
        loading={loading}
      />
    </View>
  );
};

const DiscoverView = ({ mealType }) => {
  const { recipes, source } = useLocalSearchParams();
  const { nutritionistDetail,setRefreshMealPlanFlag } = useNutritionistDetailContext();
  const [loading, setLoading] = useState(false);

  const parsedData = React.useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(recipes));
    } catch (error) {
      console.error("Error parsing recipes data:", error);
      return {};
    }
  }, [recipes]);

  const handleSwap = async (newRecipe) => {
    try {
      setLoading(true);
      const response = await axios.post(`${URL}/uploadPlan/swap-meal`, {
        userId: parsedData.clientId,
        oldRecipeId: parsedData.currentRecipe.id,
        newRecipeId: newRecipe.id,
        mealType: mealType,
        newRecipe: newRecipe,
        nutritionistId: nutritionistDetail.nutritionistId
      });

      if (response.data.success) {
        setRefreshMealPlanFlag(true);
        Alert.alert(
          "Success",
          "Meal swapped successfully!",
          [{ text: "OK", onPress: () => {
            if (source === 'singleday') {
              router.back();
            } else if(source === 'multiday') {
              router.replace('/(nutritionist)/savedplanner/savedplans');
            }
          } }]
        );
      }
    } catch (error) {
      console.error('Swap error:', error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to swap meal. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <DiscoverTab 
        mealType={mealType} 
        onSwap={handleSwap}
        loading={loading}
      />
    </View>
  );
};

const AlternativeRecipes = () => {
  const { recipes, source } = useLocalSearchParams();
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(null);
  const scrollY = new Animated.Value(0);
  
  let parsedData = {};
  let alternativeRecipes = [];
  let currentRecipe = null;
  let mealType = "";

  try {
    parsedData = JSON.parse(recipes);
    // console.log('Received recipe data:', parsedData);
    
    alternativeRecipes = parsedData.alternateRecipes?.recipes || [];
    currentRecipe = parsedData.currentRecipe;
    mealType = parsedData.mealType;

    // Validate the data
    if (!alternativeRecipes.length) {
      console.warn('No alternative recipes found in parsed data');
    }
    if (!currentRecipe) {
      console.warn('No current recipe found in parsed data');
    }
    if (!mealType) {
      console.warn('No meal type found in parsed data');
    }

  } catch (error) {
    console.error("Error parsing recipes:", error);
    Alert.alert(
      "Error",
      "Failed to load recipe data. Please try again."
    );
  }

  const openRecipeUrl = (url) => {
    if (url && typeof url === 'string') {
      Linking.openURL(url);
    } else {
      console.error("Invalid URL:", url);
    }
  };

  const toggleRecipeDetails = (index) => {
    setSelectedRecipeIndex(selectedRecipeIndex === index ? null : index);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  const getMealTypeIcon = () => {
    const type = typeof mealType === 'string' ? mealType.toLowerCase() : '';
    
    switch (type) {
      case "breakfast":
        return <MaterialCommunityIcons name="food-croissant" size={24} color="#FF9800" />;
      case "lunch":
        return <MaterialCommunityIcons name="food" size={24} color="#4CAF50" />;
      case "dinner":
        return <MaterialCommunityIcons name="food-turkey" size={24} color="#3F51B5" />;
      case "snack":
        return <MaterialCommunityIcons name="food-apple" size={24} color="#E91E63" />;
      default:
        return <MaterialCommunityIcons name="food-variant" size={24} color="#607D8B" />;
    }
  };

  const getMealTypeColor = () => {
    const type = typeof mealType === 'string' ? mealType.toLowerCase() : '';
    
    switch (type) {
      case "breakfast":
        return "#FF9800";
      case "lunch":
        return "#4CAF50";
      case "dinner":
        return "#3F51B5";
      case "snack":
        return "#E91E63";
      default:
        return "#607D8B";
    }
  };

  const getNutrientInfo = (recipe) => {
    const nutrients = [];
    
    if (recipe && recipe.totalNutrients) {
      if (recipe.totalNutrients.PROCNT) {
        nutrients.push({
          name: "Protein",
          value: Math.round(recipe.totalNutrients.PROCNT.quantity),
          unit: "g",
          icon: "nutrition",
          color: "#5E60CE"
        });
      }
      
      if (recipe.totalNutrients.CHOCDF) {
        nutrients.push({
          name: "Carbs",
          value: Math.round(recipe.totalNutrients.CHOCDF.quantity),
          unit: "g",
          icon: "barley",
          color: "#64DFDF"
        });
      }
      
      if (recipe.totalNutrients.FAT) {
        nutrients.push({
          name: "Fat",
          value: Math.round(recipe.totalNutrients.FAT.quantity),
          unit: "g",
          icon: "oil",
          color: "#FF9F1C"
        });
      }
    }
    
    return nutrients;
  };

  const mealTypeString = typeof mealType === 'string' ? mealType : '';
  const currentRecipeName = currentRecipe && typeof currentRecipe.label === 'string' 
    ? currentRecipe.label 
    : "Current Recipe";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (source === 'singleday') {
              router.back();
            } else if(source === 'multiday') {
              router.push('/(nutritionist)/savedplanner/savedplans');
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            {getMealTypeIcon()}
            <Text style={styles.heading}>
              Alternative {mealTypeString} Recipes
            </Text>
          </View>
          
          {currentRecipe && (
            <View style={styles.currentRecipeContainer}>
              <Text style={styles.subheading}>
                Alternatives for <Text style={[styles.currentRecipeName, { color: getMealTypeColor() }]}>
                  {currentRecipeName}
                </Text>
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIndicatorStyle: [styles.tabIndicator, { backgroundColor: getMealTypeColor() }],
          tabBarActiveTintColor: getMealTypeColor(),
          tabBarInactiveTintColor: '#666',
          tabBarPressColor: `${getMealTypeColor()}20`,
        }}
      >
        <Tab.Screen 
          name="Alternatives" 
          children={() => (
            <AlternativesView 
              alternativeRecipes={alternativeRecipes}
              currentRecipe={currentRecipe}
              mealType={mealType}
              openRecipeUrl={openRecipeUrl}
              getNutrientInfo={getNutrientInfo}
              getMealTypeColor={getMealTypeColor}
            />
          )}
        />
        <Tab.Screen 
          name="Collection" 
          children={() => (
            <CollectionView mealType={mealType} />
          )}
        />
        <Tab.Screen 
          name="Discover" 
          children={() => (
            <DiscoverView mealType={mealType} />
          )}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  currentRecipeContainer: {
    marginTop: 2,
  },
  subheading: {
    fontSize: 14,
    color: '#666',
  },
  currentRecipeName: {
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  noRecipes: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  goBackButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  goBackButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeCardTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedRecipeCard: {
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  recipeImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f5f5f5', // Add background color
  },
  placeholderImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  recipeMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  calorieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  calories: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    marginLeft: 6,
  },
  servingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  servingInfo: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  expandButton: {
    padding: 8,
    borderRadius: 20,
  },
  recipeDetails: {
    padding: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  nutrientsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  nutrientItem: {
    alignItems: 'center',
  },
  nutrientIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  nutrientName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cautionsContainer: {
    marginBottom: 16,
  },
  cautionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cautionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
  },
  cautionText: {
    color: '#c62828',
    fontSize: 12,
    marginLeft: 4,
  },
  ingredientsContainer: {
    marginBottom: 16,
  },
  ingredientsList: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 10,
  },
  ingredient: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  viewButton: {
    flex: 1,
    marginRight: 10,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  saveButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  swapButton: {
    backgroundColor: '#5b6af0',
    paddingHorizontal: 20,
    marginLeft: 10,
  },
  swapButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    height: 48,
  },
  tabLabel: {
    textTransform: 'none',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  tabIndicator: {
    height: 3,
    borderRadius: 3,
  },
});

export default AlternativeRecipes;