import { useState, useRef, useEffect, useCallback } from "react"
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
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLocalSearchParams } from 'expo-router'
import { useFocusEffect } from "@react-navigation/native"
import { useNavigation } from "expo-router"
import axios from 'axios'
import {URL} from '../../../../../constants/url'
import { useNutritionistDetailContext } from "../../../../context/NutritionistContext"
import CollectionModal from "./collectionModal"


const { width, height } = Dimensions.get("window")

const RecipeDetailScreen = () => {
  // Parse recipe data from params if it's a string
  const params = useLocalSearchParams();
  const recipeData = typeof params.recipe === 'string' 
    ? JSON.parse(params.recipe) 
    : params.recipe;
  
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCollection, setIsInCollection] = useState(false);
  const [payload, setPayload] = useState('');
  const {nutritionistDetail} = useNutritionistDetailContext();
  const [collectionId, setCollectionId] = useState();
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collections, setCollections] = useState([]);
  
  // Image header animation values
  const headerHeight = height * 0.45;
  const imageOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight / 2, headerHeight],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });
  
  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });
  
  const headerScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });
  
  const shareRecipe = async () => {
    try {
      await Share.share({
        message: `Check out this delicious recipe: ${recipeData.label}!`,
        url: recipeData.url,
      });
    } catch (error) {
      console.error("Error sharing recipe:", error);
    }
  };
  
  const openSourceUrl = () => {
    if (recipeData.url) {
      Linking.openURL(recipeData.url);
    }
  };

  const saveRecipe = async (payload) =>{
    const response = await axios.post(`${URL}/api/recipes`,payload)
    console.log(response);
    
  }

  const getCollections = async () => {
    try {
      const response = await axios.post(`${URL}/api/collections/collections/get`, { id: nutritionistDetail.userId });
      console.log(response.data);
      if (response.data && response.data.collections) {
        setCollections(response.data.collections);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addToCollection = () => {
    setShowCollectionModal(true);
  };

  const saveRecipeToCollection = async (recipeData, collectionId) =>{
    try {
      const saveRecipeResponse = await axios.post(`${URL}/api/collections/collections/add-recipe`,{
        recipeData,
        collectionId
      }
      )
    } catch (error) {
      console.log("Error Saving Recipe:", error.response);
    }
  }

  // Add a function to handle collection selection
  const handleSelectCollection = (collectionId) => {
    console.log(`Adding recipe to collection: ${collectionId}`);
    setCollectionId(collectionId);
    setIsInCollection(true);
    
    // Here you would add logic to save the recipe to the selected collection
    // For example:
    saveRecipeToCollection(recipeData, collectionId);
  };

  useEffect(()=>{
    if(payload){
      saveRecipe(payload)
    }
  },[payload])

  useFocusEffect(
    useCallback(()=>{
      getCollections()
    },[])
  )
  
  const renderNutrientInfo = (label, value, unit, daily) => (
    <View style={styles.nutrientRow}>
      <Text style={styles.nutrientLabel}>{label}</Text>
      <View style={styles.nutrientValueContainer}>
        <Text style={styles.nutrientValue}>{Math.round(value)} {unit}</Text>
        {daily && <Text style={styles.dailyValue}>({Math.round(daily)}% DV)</Text>}
      </View>
    </View>
  );
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Animated Recipe Image Header */}
      <Animated.View 
        style={[
          styles.imageContainer, 
          { 
            opacity: imageOpacity,
            transform: [{ translateY: imageTranslateY }, { scale: headerScale }],
            height: headerHeight,
          }
        ]}
      >
        <Image 
          source={{ uri: recipeData.image }} 
          style={styles.recipeImage} 
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.imageGradient}
        />
      </Animated.View>
      
      {/* Back Button */}
      <TouchableOpacity 
        style={[styles.backButton, { top: insets.top + 10 }]} 
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <BlurView intensity={80} tint="dark" style={styles.blurButton}>
          <Feather name="arrow-left" size={24} color="white" />
        </BlurView>
      </TouchableOpacity>
      
      {/* Action Buttons */}
      <View style={[styles.actionButtons, { top: insets.top + 10 }]}>
        <TouchableOpacity onPress={shareRecipe} style={styles.actionButton} activeOpacity={0.7}>
          <BlurView intensity={80} tint="dark" style={styles.blurButton}>
            <Feather name="share" size={22} color="white" />
          </BlurView>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setIsFavorite(!isFavorite)} 
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <BlurView intensity={80} tint="dark" style={styles.blurButton}>
            <Feather 
              name={isFavorite ? "heart" : "heart"} 
              size={22} 
              color={isFavorite ? "#FF3B30" : "white"} 
              solid={isFavorite}
            />
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={addToCollection} 
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <BlurView intensity={80} tint="dark" style={styles.blurButton}>
            <Feather 
              name={isInCollection ? "bookmark" : "bookmark"} 
              size={22} 
              color={isInCollection ? "#FFD700" : "white"} 
              solid={isInCollection}
            />
          </BlurView>
        </TouchableOpacity>
      </View>
      
      {/* Scrollable Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Card with Recipe Basic Info */}
        <View style={styles.detailsContainer}>
          <View style={styles.titleCard}>
            <Text style={styles.recipeTitle}>{recipeData.label}</Text>
            
            <View style={styles.recipeMetaContainer}>
              <View style={styles.metaItem}>
                <Feather name="clock" size={18} color="#666" />
                <Text style={styles.metaText}>
                  {recipeData.totalTime > 0 ? `${recipeData.totalTime} min` : 'Quick'}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <Feather name="bar-chart-2" size={18} color="#666" />
                <Text style={styles.metaText}>
                  {Math.round(recipeData.calories)} cal
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <Feather name="users" size={18} color="#666" />
                <Text style={styles.metaText}>
                  {recipeData.yield} servings
                </Text>
              </View>
            </View>
            
            {recipeData.dietLabels && recipeData.dietLabels.length > 0 && (
              <View style={styles.tagsContainer}>
                {recipeData.dietLabels.map((label, index) => (
                  <View key={index} style={styles.dietTag}>
                    <Text style={styles.tagText}>{label}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.sourceButton} 
              onPress={openSourceUrl}
              activeOpacity={0.7}
            >
              <Text style={styles.sourceText}>
                Source: {recipeData.source}
              </Text>
              <Feather name="external-link" size={16} color="#0080ff" />
            </TouchableOpacity>
          </View>
          
          {/* Ingredients Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipeData.ingredientLines.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
          
          {/* Nutritional Information */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Nutrition Facts</Text>
            <Text style={styles.servingInfo}>Per serving</Text>
            
            <View style={styles.calorieContainer}>
              <Text style={styles.calorieValue}>{Math.round(recipeData.calories / recipeData.yield)}</Text>
              <Text style={styles.calorieLabel}>CALORIES</Text>
            </View>
            
            <View style={styles.nutritionDivider} />
            
            {renderNutrientInfo(
              'Fat', 
              recipeData.totalNutrients.FAT.quantity / recipeData.yield, 
              recipeData.totalNutrients.FAT.unit,
              recipeData.totalDaily.FAT.quantity / recipeData.yield
            )}
            
            {renderNutrientInfo(
              'Carbs', 
              recipeData.totalNutrients.CHOCDF.quantity / recipeData.yield, 
              recipeData.totalNutrients.CHOCDF.unit,
              recipeData.totalDaily.CHOCDF.quantity / recipeData.yield
            )}
            
            {renderNutrientInfo(
              'Protein', 
              recipeData.totalNutrients.PROCNT.quantity / recipeData.yield, 
              recipeData.totalNutrients.PROCNT.unit,
              recipeData.totalDaily.PROCNT.quantity / recipeData.yield
            )}
            
            {renderNutrientInfo(
              'Sodium', 
              recipeData.totalNutrients.NA.quantity / recipeData.yield, 
              recipeData.totalNutrients.NA.unit,
              recipeData.totalDaily.NA.quantity / recipeData.yield
            )}
            
            {renderNutrientInfo(
              'Fiber', 
              recipeData.totalNutrients.FIBTG.quantity / recipeData.yield, 
              recipeData.totalNutrients.FIBTG.unit,
              recipeData.totalDaily.FIBTG.quantity / recipeData.yield
            )}
          </View>
          
          {/* Health Labels Section */}
          {recipeData.healthLabels && recipeData.healthLabels.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Health Info</Text>
              <View style={styles.healthTagsContainer}>
                {recipeData.healthLabels.map((label, index) => (
                  <View key={index} style={styles.healthTag}>
                    <Text style={styles.healthTagText}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Add to Collection Button */}
          <TouchableOpacity 
            style={[
              styles.collectionButton, 
              isInCollection ? styles.collectionButtonActive : {}
            ]}
            onPress={addToCollection}
            activeOpacity={0.8}
          >
            <Feather 
              name="bookmark" 
              size={20} 
              color={isInCollection ? "#fff" : "#0080FF"} 
            />
            <Text style={[
              styles.collectionButtonText,
              isInCollection ? styles.collectionButtonTextActive : {}
            ]}>
              {isInCollection ? "Saved to Collection" : "Add to Collection"}
            </Text>
          </TouchableOpacity>
          
          {/* Bottom Spacer */}
          <View style={{ height: 40 }} />
        </View>
      </Animated.ScrollView>
      <CollectionModal
        visible={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        collections={collections}
        onSelectCollection={handleSelectCollection}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    position: 'absolute',
    width: width,
    overflow: 'hidden',
    zIndex: 0,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
  },
  blurButton: {
    borderRadius: 20,
    overflow: 'hidden',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
  },
  detailsContainer: {
    marginTop: height * 0.4,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 40,
    minHeight: height * 0.6,
  },
  titleCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  recipeMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 6,
    fontSize: 15,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dietTag: {
    backgroundColor: '#E6F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#0080FF',
    fontSize: 13,
    fontWeight: '600',
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    color: '#0080FF',
    fontSize: 14,
    marginRight: 6,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0080FF',
    marginTop: 6,
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
    lineHeight: 22,
  },
  servingInfo: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  calorieContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  calorieValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#0080FF',
  },
  calorieLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  nutritionDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nutrientLabel: {
    fontSize: 15,
    color: '#444',
  },
  nutrientValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutrientValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  dailyValue: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  healthTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  healthTag: {
    backgroundColor: '#F0F8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  healthTagText: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '500',
  },
  collectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#0080FF',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  collectionButtonActive: {
    backgroundColor: '#0080FF',
    borderColor: '#0080FF',
  },
  collectionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0080FF',
    marginLeft: 8,
  },
  collectionButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default RecipeDetailScreen;