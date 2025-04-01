import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Animated,
  Dimensions,
  FlatList
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// This component would be part of your PlannerScreen
// I'm showing just the meal card section for clarity

const MealPlanSection = ({ plan, fadeAnim, slideAnim }) => {
  // Group meals by mealType
  const mealsByType = {};
  
  if (plan && plan.meals) {
    plan.meals.forEach(meal => {
      if (!mealsByType[meal.mealType]) {
        mealsByType[meal.mealType] = [];
      }
      mealsByType[meal.mealType].push(meal);
    });
  }
  
  return (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconContainer, { backgroundColor: '#FF9800' }]}>
          <Feather name="coffee" size={18} color="#fff" />
        </View>
        <Text style={styles.sectionTitle}>Meal Plan</Text>
      </View>
      
      {Object.keys(mealsByType).map((mealType, index) => (
        <MealTypeCard 
          key={mealType} 
          mealType={mealType} 
          meals={mealsByType[mealType]} 
          index={index}
          slideAnim={slideAnim}
        />
      ))}
    </Animated.View>
  );
};

const MealTypeCard = ({ mealType, meals, index, slideAnim }) => {
  const [expanded, setExpanded] = useState(true);
  
  // Get meal type icon
  const getMealTypeIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'breakfast':
        return 'coffee';
      case 'lunch':
        return 'box';
      case 'dinner':
        return 'moon';
      case 'snack':
        return 'apple';
      default:
        return 'coffee';
    }
  };
  
  // Get meal type color
  const getMealTypeColor = (type) => {
    switch(type.toLowerCase()) {
      case 'breakfast':
        return '#FF9800';
      case 'lunch':
        return '#4CAF50';
      case 'dinner':
        return '#5b6af0';
      case 'snack':
        return '#F44336';
      default:
        return '#5b6af0';
    }
  };
  
  return (
    <Animated.View 
      style={[
        styles.mealTypeCard,
        {
          transform: [
            { translateY: slideAnim.interpolate({
              inputRange: [0, 30],
              outputRange: [0, 30 + index * 10]
            }) }
          ]
        }
      ]}
    >
      <TouchableOpacity 
        style={[
          styles.mealTypeHeader, 
          { borderLeftColor: getMealTypeColor(mealType) }
        ]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.mealTypeHeaderLeft}>
          <View style={[styles.mealTypeIconContainer, { backgroundColor: getMealTypeColor(mealType) }]}>
            <Feather name={getMealTypeIcon(mealType)} size={16} color="#fff" />
          </View>
          <Text style={styles.mealTypeTitle}>{mealType}</Text>
          <View style={styles.mealCountBadge}>
            <Text style={styles.mealCountText}>{meals.length}</Text>
          </View>
        </View>
        <Feather 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#777" 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.mealsContainer}>
          {meals.map((meal, mealIndex) => (
            <MealCard 
              key={mealIndex} 
              meal={meal} 
              mealIndex={mealIndex}
              isLast={mealIndex === meals.length - 1}
              mealTypeColor={getMealTypeColor(mealType)}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const MealCard = ({ meal, mealIndex, isLast, mealTypeColor }) => {
  const [expanded, setExpanded] = useState(false);
  const [favorite, setFavorite] = useState(false);
  
  // Swipe to dismiss meal handler
  const onMealGestureEvent = (event) => {
    if (event.nativeEvent.state === State.END && 
        Math.abs(event.nativeEvent.translationX) > width * 0.3) {
      // Implement swipe to dismiss logic here if needed
      // For now just trigger haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };
  
  // Generate a placeholder image URL based on the meal name
  const getImageUrl = (mealName) => {
    return `https://source.unsplash.com/300x200/?${encodeURIComponent(mealName.split(' ')[0])}`;
  };
  
  // Calculate nutrition values (these would come from your API)
  const calories = Math.round(meal.recipe.calories / meal.recipe.yield);
  const protein = Math.round((meal.recipe.totalNutrients?.PROCNT?.quantity || 0) / meal.recipe.yield);
  const carbs = Math.round((meal.recipe.totalNutrients?.CHOCDF?.quantity || 0) / meal.recipe.yield);
  const fat = Math.round((meal.recipe.totalNutrients?.FAT?.quantity || 0) / meal.recipe.yield);
  
  return (
    <PanGestureHandler onHandlerStateChange={onMealGestureEvent}>
      <View style={[styles.mealCardContainer, isLast && styles.lastMealCard]}>
        <View style={styles.mealCard}>
          <View style={styles.mealCardImageContainer}>
            <Image 
              source={{ uri: getImageUrl(meal.recipe.label) }}
              style={styles.mealCardImage}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => {
                setFavorite(!favorite);
                if (Platform.OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Feather 
                name={favorite ? "heart" : "heart"} 
                size={18} 
                color={favorite ? "#F44336" : "#fff"} 
                style={favorite ? {} : styles.outlineHeart}
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.mealCardContent}>
            <Text style={styles.mealTitle} numberOfLines={2}>{meal.recipe.label}</Text>
            
            <View style={styles.mealMacros}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{calories}</Text>
                <Text style={styles.macroLabel}>calories</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{protein}g</Text>
                <Text style={styles.macroLabel}>protein</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{carbs}g</Text>
                <Text style={styles.macroLabel}>carbs</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{fat}g</Text>
                <Text style={styles.macroLabel}>fat</Text>
              </View>
            </View>
            
            <View style={styles.mealCardFooter}>
              <View style={styles.mealTags}>
                <View style={styles.mealTag}>
                  <Text style={styles.mealTagText}>30 min</Text>
                </View>
                {meal.recipe.healthLabels?.includes('Vegetarian') && (
                  <View style={[styles.mealTag, { backgroundColor: '#4CAF5022' }]}>
                    <Text style={[styles.mealTagText, { color: '#4CAF50' }]}>Vegetarian</Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={[styles.expandButton, expanded && { backgroundColor: mealTypeColor }]}
                onPress={() => setExpanded(!expanded)}
              >
                <Feather 
                  name={expanded ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={expanded ? "#fff" : "#777"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {expanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.expandedTitle}>Ingredients</Text>
            {meal.recipe.ingredientLines?.slice(0, 5).map((ingredient, i) => (
              <View key={i} style={styles.ingredientItem}>
                <View style={styles.ingredientDot} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
            {(meal.recipe.ingredientLines?.length > 5) && (
              <Text style={styles.moreIngredientsText}>+{meal.recipe.ingredientLines.length - 5} more ingredients</Text>
            )}
            
            <View style={styles.expandedActions}>
              <TouchableOpacity style={[styles.expandedButton, { backgroundColor: mealTypeColor }]}>
                <Feather name="eye" size={16} color="#fff" />
                <Text style={styles.expandedButtonText}>View Recipe</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.expandedButton}>
                <Feather name="refresh-cw" size={16} color="#555" />
                <Text style={styles.expandedButtonText}>Replace</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5b6af0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  mealTypeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
  },
  mealTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderLeftWidth: 4,
  },
  mealTypeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  mealTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mealCountBadge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  mealCountText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  mealsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mealCardContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
  },
  lastMealCard: {
    marginBottom: 0,
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  mealCardImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mealCardImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineHeart: {
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mealCardContent: {
    flex: 1,
    paddingLeft: 12,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  mealMacros: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  macroLabel: {
    fontSize: 10,
    color: '#777',
  },
  macroDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#f0f0f0',
  },
  mealCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  mealTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
  },
  mealTagText: {
    fontSize: 10,
    color: '#555',
  },
  expandButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  expandedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ingredientDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#555',
    marginTop: 6,
    marginRight: 8,
  },
  ingredientText: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  moreIngredientsText: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
    marginTop: 4,
  },
  expandedActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  expandedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  expandedButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
    marginLeft: 6,
  },
});

// Usage in your main component:
// <MealPlanSection plan={plan} fadeAnim={fadeAnim} slideAnim={slideAnim} />