import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import debounce from 'lodash/debounce';
import axios from 'axios';

const DiscoverTab = ({ mealType, onSwap, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingState, setLoadingState] = useState(false);

  const searchRecipes = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoadingState(true);
      const response = await axios.get(
        `https://api.edamam.com/api/recipes/v2`, {
          params: {
            type: 'public',
            q: query,
            app_id: '2de26262',
            app_key: 'b536c3e879fa6545e57c085ee3af42ee',
            mealType: mealType,
          }
        }
      );

      // Transform the API response to match our expected format
      const transformedResults = response.data.hits.map(hit => ({
        id: hit.recipe.uri.split('#recipe_')[1],
        label: hit.recipe.label,
        image: hit.recipe.image,
        calories: hit.recipe.calories,
        totalTime: hit.recipe.totalTime,
        yield: hit.recipe.yield,
        dietLabels: hit.recipe.dietLabels,
        healthLabels: hit.recipe.healthLabels,
        ingredients: hit.recipe.ingredients,
        nutrients: hit.recipe.totalNutrients,
        url: hit.recipe.url
      }));

      setSearchResults(transformedResults);
    } catch (error) {
      console.error('Error searching recipes:', error);
      if (error.response) {
        console.log('API Error Response:', error.response.data);
      }
      setSearchResults([]);
    } finally {
      setLoadingState(false);
    }
  };

  // Debounce the search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((query) => searchRecipes(query), 500),
    []
  );

  const handleSearch = (text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity style={styles.recipeCard} onPress={() => {}}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.recipeImage}
        defaultSource={require('../../../../../assets/images/avocado.png')}
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {item.label}
        </Text>
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="fire" size={16} color="#FF9800" />
            <Text style={styles.metaText}>{Math.round(item.calories)} cal</Text>
          </View>
          {item.totalTime > 0 && (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#4CAF50" />
              <Text style={styles.metaText}>{item.totalTime} min</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={() => {}}>
          <Ionicons name="bookmark-outline" size={18} color="#5b6af0" />
          <Text style={styles.saveButtonText}>Save Recipe</Text>
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
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
      </View>

      {loadingState ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5b6af0" />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            searchResults.length === 0 && styles.emptyListContainer
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name={searchQuery ? "magnify-close" : "magnify"} 
                size={48} 
                color="#ccc" 
              />
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? 'No recipes found. Try different keywords!' 
                  : 'Search for recipes by name, ingredients, or cuisine'
                }
              </Text>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 60,
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
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImage: {
    width: '100%',
    height: 160,
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  metaInfo: {
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#5b6af0',
    marginLeft: 4,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  swapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5b6af0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
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

export default DiscoverTab;