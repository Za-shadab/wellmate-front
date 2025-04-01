import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNutritionistDetailContext } from '../../../context/NutritionistContext';
import axios from 'axios';
import {URL} from '../../../../constants/url'


const CollectionTab = ({ mealType, onSwap, loading }) => {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const { nutritionistDetail } = useNutritionistDetailContext();
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await axios.post(`${URL}/api/collections/collections/get`, { 
        id: nutritionistDetail.userId 
      });
      setCollections(response.data.collections);
      
      // If there are collections, select the first one by default
      if (response.data.collections.length > 0) {
        setSelectedCollection(response.data.collections[0]);
        fetchRecipesForCollection(response.data.collections[0]._id);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const fetchRecipesForCollection = async (collectionId) => {
    try {
      // setLoading(true);
      const response = await axios.post(`${URL}/api/collections/collections/recipes`, { 
        collectionId 
      });
      setSavedRecipes(response.data.recipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionSelect = (collection) => {
    setSelectedCollection(collection);
    fetchRecipesForCollection(collection._id);
    setIsModalVisible(false);
  };

  const CollectionSelector = () => (
    <Pressable 
      style={styles.collectionSelector}
      onPress={() => setIsModalVisible(true)}
    >
      <Text style={styles.collectionName}>
        {selectedCollection?.name || 'Select Collection'}
      </Text>
      <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
    </Pressable>
  );

  const renderRecipeItem = ({ item }) => (
    <View style={styles.recipeCard}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.recipeImage}
        defaultSource={require('../../../../../assets/images/avocado.png')}
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {item.label}
        </Text>
        <View style={styles.recipeMetaInfo}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="fire" size={16} color="#FF9800" />
            <Text style={styles.metaText}>{Math.round(item.calories)} cal</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#4CAF50" />
            <Text style={styles.metaText}>{item.totalTime} min</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Ionicons name="open-outline" size={18} color="#5b6af0" />
            <Text style={styles.buttonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Ionicons name="trash-outline" size={18} color="#ef5350" />
            <Text style={[styles.buttonText, { color: '#ef5350' }]}>Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.swapButton, loading && styles.swapButtonDisabled]}
            onPress={() => onSwap(item)}
            disabled={loading}
          >
            <MaterialCommunityIcons 
              name="swap-horizontal" 
              size={18} 
              color="#fff" 
            />
            <Text style={styles.swapButtonText}>
              {loading ? 'Swapping...' : 'Swap Meal'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <CollectionSelector />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5b6af0" />
        </View>
      ) : (
        <>
          {!selectedCollection ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="folder-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No collections found</Text>
            </View>
          ) : savedRecipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="bookmark-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No saved recipes in this collection</Text>
            </View>
          ) : (
            <FlatList
              data={savedRecipes}
              renderItem={renderRecipeItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Collection</Text>
            <FlatList
              data={collections}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.collectionItem}
                  onPress={() => handleCollectionSelect(item)}
                >
                  <Text style={styles.collectionItemText}>{item.name}</Text>
                  {selectedCollection?._id === item._id && (
                    <MaterialCommunityIcons name="check" size={20} color="#5b6af0" />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImage: {
    width: 100,
    height: 100,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recipeMetaInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 14,
    color: '#5b6af0',
    marginLeft: 4,
  },
  collectionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  collectionItemText: {
    fontSize: 16,
    color: '#333',
  },
  swapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5b6af0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  swapButtonDisabled: {
    backgroundColor: '#ccc',
  },
  swapButtonText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
  },
  swapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5b6af0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  swapButtonDisabled: {
    opacity: 0.6,
  },
  swapButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CollectionTab;