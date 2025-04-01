import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios'; 
import { URL } from '../../../../../constants/url';

const API_BASE_URL = `${URL}/api/collections`; 

const CollectionData = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Parse the JSON string from params
  const collectionDetailStr = params.CollectionDetail || '{}';
  let initialCollectionDetail = {};
  
  try {
    initialCollectionDetail = JSON.parse(collectionDetailStr);
  } catch (error) {
    console.error("Error parsing collection detail:", error);
  }
  
  // State to manage collection data and loading states
  const [collectionDetail, setCollectionDetail] = useState(initialCollectionDetail);
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Extract data from the state
  const { id, title, imageUrl, items = [] } = collectionDetail;
  
  // Function to fetch collection data
//   const fetchCollectionData = async () => {
//     try {
//       // Replace with your actual endpoint to get collection details
//       const response = await axios.get(`${API_BASE_URL}/collections/${id}`);
//       if (response.data) {
//         setCollectionDetail(response.data);
//       }
//     } catch (error) {
//       console.error("Error fetching collection data:", error);
//       Alert.alert("Error", "Could not refresh collection data");
//     } finally {
//       setRefreshing(false);
//     }
//   };
  
  // Pull to refresh handler
//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchCollectionData();
//   }, [id]);
  
  // Function to handle recipe deletion
  const handleDeleteRecipe = (recipeId) => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to remove this recipe from the collection?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              
              // Call the API endpoint to remove the recipe
              const response = await axios.post(`${API_BASE_URL}/collections/remove-recipe`, {
                collectionId: id,
                recipeId: recipeId
              });
              
              if (response.status === 200) {
                // Update the local state to reflect the change
                const updatedItems = items.filter(item => item._id !== recipeId);
                setCollectionDetail({
                  ...collectionDetail,
                  items: updatedItems
                });
                
                // Show success message
                Alert.alert("Success", "Recipe removed from collection");
              }
            } catch (error) {
              console.error("Error removing recipe:", error);
              const errorMessage = error.response?.data?.message || "Failed to remove recipe";
              Alert.alert("Error", errorMessage);
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  // Function to view recipe details
  const viewRecipeDetails = (recipe) => {
    // You would navigate to recipe details screen here
    // For example: router.push(`/recipe/${recipe._id}`);
    console.log("Viewing recipe:", recipe.label);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.coverImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="images-outline" size={48} color="#999" />
          </View>
        )}
        <View style={styles.headerOverlay}>
          <Text style={styles.collectionTitle}>{title || 'Collection'}</Text>
          <Text style={styles.recipeCount}>
            {items.length} {items.length === 1 ? 'Recipe' : 'Recipes'}
          </Text>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            // onRefresh={onRefresh} 
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        <View style={styles.recipesContainer}>
          <Text style={styles.sectionTitle}>Recipes</Text>
          
          {items.length > 0 ? (
            items.map((item) => (
              <View key={item._id} style={styles.recipeCardContainer}>
                <TouchableOpacity 
                  style={styles.recipeCard}
                  onPress={() => viewRecipeDetails(item)}
                  activeOpacity={0.8}
                  disabled={isDeleting}
                >
                  <Image 
                    source={{ uri: item.image || (item.images && item.images.REGULAR && item.images.REGULAR.url) }} 
                    style={styles.recipeImage} 
                    defaultSource={require('../../../../../../assets/images/avocado.png')} // Add a default image in your assets
                  />
                  <View style={styles.recipeImageOverlay}>
                    {item.totalTime > 0 && (
                      <View style={styles.timeTag}>
                        <Ionicons name="time-outline" size={12} color="white" />
                        <Text style={styles.timeTagText}>{item.totalTime} min</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeTitle} numberOfLines={2}>{item.label}</Text>
                    <Text style={styles.recipeSource} numberOfLines={1}>{item.source}</Text>
                    
                    {/* Nutrition info */}
                    <View style={styles.nutritionContainer}>
                      {item.calories && (
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionValue}>{Math.round(item.calories / item.yield)}</Text>
                          <Text style={styles.nutritionLabel}>CAL</Text>
                        </View>
                      )}
                      
                      {item.totalNutrients && item.totalNutrients.PROCNT && (
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionValue}>
                            {Math.round(item.totalNutrients.PROCNT.quantity / item.yield)}g
                          </Text>
                          <Text style={styles.nutritionLabel}>PROTEIN</Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Diet & Health labels */}
                    <View style={styles.labelsContainer}>
                      {item.dietLabels && item.dietLabels.slice(0, 2).map((label, idx) => (
                        <View key={`diet-${idx}`} style={styles.dietLabel}>
                          <Text style={styles.dietLabelText}>{label}</Text>
                        </View>
                      ))}
                      
                      {item.healthLabels && item.healthLabels.slice(0, 2).map((label, idx) => (
                        <View key={`health-${idx}`} style={styles.healthLabel}>
                          <Text style={styles.healthLabelText}>{label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.deleteButton, isDeleting && styles.disabledButton]}
                  onPress={() => handleDeleteRecipe(item._id)}
                  disabled={isDeleting}
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No recipes in this collection yet</Text>
              <TouchableOpacity 
                style={styles.addRecipeButton}
                onPress={() => router.push('/recipe-search')} // Replace with your actual route
              >
                <Text style={styles.addRecipeButtonText}>Add Recipes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    position: 'relative',
    height: 220,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  collectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  recipeCount: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 15,
    paddingHorizontal: 15,
  },
  recipesContainer: {
    padding: 10,
    paddingBottom: 30, // Add extra padding at the bottom
  },
  recipeCardContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    flexDirection: 'row',
    height: 150,
  },
  recipeImage: {
    width: 130,
    height: '100%',
  },
  recipeImageOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeTagText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  recipeInfo: {
    flex: 1,
    padding: 15,
  },
  recipeTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  recipeSource: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  nutritionContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  nutritionItem: {
    marginRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 3,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dietLabel: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  dietLabelText: {
    fontSize: 12,
    color: '#1976d2',
  },
  healthLabel: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  healthLabelText: {
    fontSize: 12,
    color: '#388e3c',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff6b6b',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 5,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  emptyState: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginVertical: 15,
  },
  addRecipeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 15,
  },
  addRecipeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CollectionData;