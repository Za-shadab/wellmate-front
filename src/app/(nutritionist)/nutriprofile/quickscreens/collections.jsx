import React, { useState, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  Animated,
  Easing,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNutritionistDetailContext } from '../../../context/NutritionistContext';
import { URL } from '../../../../constants/url';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';



// Collection Card Component with animations
const CollectionCard = ({ collection, onPress, onDelete }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Collection",
      `Are you sure you want to delete "${collection.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            // Animate the deletion
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              onDelete(collection.id);
            });
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.card} 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Image 
          source={{ uri: collection.imageUrl }} 
          style={styles.cardImage} 
          resizeMode="cover"
        />
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTitle}>{collection.title}</Text>
          <Text style={styles.cardSubtitle}>{collection.recipeCount} recipes</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main Screen Component
const RecipeCollectionsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { nutritionistDetail } = useNutritionistDetailContext();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;

  const getCollections = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await axios.post(`${URL}/api/collections/collections/get`, { id: nutritionistDetail.userId });
      
      const formattedCollections = response.data.collections.map((collection) => {
        return {
          id: collection._id,
          title: collection.name,
          imageUrl: collection.coverImage || 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          recipeCount: collection.items.length,
          items: collection.items
        };
      });
      
      setCollections(formattedCollections);
      
      // Animate the content in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to load collections. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const createCollection = async (collectionName) => {
    try {
      // Add the new collection with the entered name
      await axios.post(`${URL}/api/collections/collections`, {
        id: nutritionistDetail.userId,
        name: collectionName,
      });
      
      // Refresh collections after creating
      getCollections(false);
      
      // Reset and close modal
      setNewCollectionName('');
      closeModal();
      
      // Show success message
      Alert.alert("Success", "Collection created successfully!");
      
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to create collection. Please try again.");
    }
  };

  const deleteCollection = async (collectionId) => {
    try {
      await axios.post(`${URL}/api/collections/collections/remove-collection`,
        { collectionId }
      );
      
      // Update local state to remove the deleted collection
      setCollections(collections.filter(collection => collection.id !== collectionId));
      
    } catch (error) {
      console.log(error.response);
      Alert.alert("Error", "Failed to delete collection. Please try again.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      getCollections();
    }, [])
  );
  
  const handleCollectionPress = (collection) => {
    const route = {
      pathname: "/nutriprofile/quickscreens/collectiondetail/[collectionInfo]",
      params: { CollectionDetail: encodeURIComponent(JSON.stringify(collection)) }
    };
  
    router.push(route);
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.timing(modalScaleAnim, {
      toValue: 0.9,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setNewCollectionName('');
    });
  };

  const handleAddCollection = () => {
    openModal();
  };

  const handleCreateCollection = () => {
    if (newCollectionName.trim() === '') {
      Alert.alert("Error", "Please enter a collection name");
      return;
    }
    
    createCollection(newCollectionName);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    getCollections(true);
  };

  const renderItem = ({ item }) => (
    <CollectionCard 
      collection={item} 
      onPress={() => handleCollectionPress(item)}
      onDelete={deleteCollection}
    />
  );

  const renderEmptyState = () => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyState}>
        <Ionicons name="folder-open-outline" size={64} color="#ccc" />
        <Text style={styles.emptyStateTitle}>No Collections Yet</Text>
        <Text style={styles.emptyStateText}>Create your first collection to organize your recipes</Text>
        <TouchableOpacity 
          style={styles.emptyStateButton}
          onPress={handleAddCollection}
        >
          <Text style={styles.emptyStateButtonText}>Create Collection</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Collections</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddCollection}
          activeOpacity={0.7}
        >
          <View style={styles.addButtonContainer}>
            <Ionicons name="add" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search collections..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Loading Indicator */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0080FF" />
        </View>
      ) : (
        /* Collections Grid */
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={collections.filter(collection => 
              collection.title.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={[
              styles.listContainer,
              collections.length === 0 && styles.emptyListContainer
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
          />
        </Animated.View>
      )}

      {/* Add Collection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ scale: modalScaleAnim }] }
            ]}
          >
            <Text style={styles.modalTitle}>Create New Collection</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Collection Name"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              autoFocus
              maxLength={30}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.button, 
                  styles.createButton,
                  !newCollectionName.trim() && styles.disabledButton
                ]} 
                onPress={handleCreateCollection}
                disabled={!newCollectionName.trim()}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, styles.createButtonText]}>Create</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 48 = padding and gap

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 4,
  },
  addButtonContainer: {
    backgroundColor: '#0080FF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#0080FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
    marginLeft: 4,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  cardContainer: {
    width: cardWidth,
    height: 160,
    marginBottom: 16,
    marginRight: 16,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,59,48,0.8)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty state styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#0080FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width - 60,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
  },
  createButton: {
    backgroundColor: '#0080FF',
  },
  disabledButton: {
    backgroundColor: '#b3d9ff',
    opacity: 0.7,
  },
  createButtonText: {
    color: 'white',
  },
});

export default RecipeCollectionsScreen;