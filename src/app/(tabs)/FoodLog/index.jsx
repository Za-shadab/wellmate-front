import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { gql, useLazyQuery } from "@apollo/client";
import { router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const SEARCH_QUERY = gql`
  query MyQuery($ingr: String, $upc: String) {
    search(ingr: $ingr, upc: $upc) {
      hints {
        food {
          label
          foodId
          image
          nutrients {
            ENERC_KCAL
            FAT
            FIBTG
            PROCNT
            CHOCDF
          }
          servingSizes {
            label
            quantity
          }
          servingsPerContainer
        }
        measures {
          label
          qualified {
            qualifiers {
              label
            }
            weight
          }
          weight
        }
      }
      text
    }
  }
`;

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const [searchFood, { data, loading, error }] = useLazyQuery(SEARCH_QUERY);
  const [permission, requestPermission] = useCameraPermissions();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scanButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate elements in when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    if (permission === null) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 800); // Reduced debounce time
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedTerm) {
      searchFood({ variables: { ingr: debouncedTerm } });
    }
  }, [debouncedTerm, searchFood]);

  const handleBarCodeScanned = async ({ data }) => {
    console.log("Scanned UPC:", data);
    setScannerEnabled(false);
  
    try {
      const { data: searchData } = await searchFood({ variables: { upc: data } });
  
      if (searchData?.search?.hints?.length > 0) {
        const foodItem = searchData.search.hints[0];
        console.log("Navigating to barcode screen.........");
        
        router.push({
          pathname: "/FoodLog/BarCodeDetailScreen/[barcodeDetail]",
          params: { barcodeData: JSON.stringify(foodItem) },
        });
      } else {
        console.log("No food found for this UPC.");
      }
    } catch (error) {
      console.error("Error fetching food details:", error);
    }
  };

  const animateScanButton = () => {
    Animated.sequence([
      Animated.timing(scanButtonScale, {
        toValue: 1.15,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scanButtonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => setScannerEnabled(true));
  };
  
  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyStateContainer}>
        <MaterialCommunityIcons name="food-fork-drink" size={70} color="#E0E0E0" />
        <Text style={styles.emptyStateText}>No food items found</Text>
        <Text style={styles.emptyStateSubText}>Try searching for something else or scan a barcode</Text>
      </View>
    );
  };

  if (scannerEnabled) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView 
          style={{ flex: 1 }} 
          onBarcodeScanned={handleBarCodeScanned} 
        />
        <View style={styles.scannerOverlay}>
          <View style={styles.scanBox} />
          <Text style={styles.scanInstructions}>Align barcode within the frame</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setScannerEnabled(false)}
        >
          <Ionicons name="close-circle" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }
    
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <Animated.View 
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY }] }
        ]}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#FF9800', '#FF5722']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <Text style={styles.header}>Food Finder</Text>
          </LinearGradient>
          
          <View style={styles.searchContainer}>
            <View style={[
              styles.searchBarWrapper,
              isSearchFocused && styles.searchBarWrapperFocused
            ]}>
              <Ionicons 
                name="search" 
                size={20} 
                color={isSearchFocused ? "#FF7043" : "#777"} 
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchBar}
                placeholder="Search for any food..."
                placeholderTextColor="#999"
                value={searchTerm}
                onChangeText={setSearchTerm}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setSearchTerm("")}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            
            <Animated.View 
              style={[
                styles.scanButtonContainer,
                { transform: [{ scale: scanButtonScale }] }
              ]}
            >
              <TouchableOpacity
                style={styles.scanButton}
                onPress={animateScanButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF9800', '#FF5722']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.scanButtonGradient}
                >
                  <Ionicons name="barcode-outline" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF7043" />
            <Text style={styles.loadingText}>Finding food items...</Text>
          </View>
        ) : (
          <>
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={24} color="#f44336" />
                <Text style={styles.errorText}>Failed to search. Please try again.</Text>
              </View>
            )}

            <View style={styles.resultsContainer}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionHeader}>
                  {data?.search?.hints?.length > 0 ? 'Search Results' : 'Enter food to search'}
                </Text>
                {data?.search?.hints?.length > 0 && (
                  <Text style={styles.resultCount}>
                    {data.search.hints.length} {data.search.hints.length === 1 ? 'item' : 'items'}
                  </Text>
                )}
              </View>

              <FlatList
                data={data?.search?.hints || []}
                keyExtractor={(item, index) =>
                  item.food?.foodId ? `${item.food.foodId}-${index}` : `${index}`
                }
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.foodItemCard}
                    android_ripple={{ color: 'rgba(0, 0, 0, 0.05)' }}
                    onPress={() => {
                      try {
                        if (item && item.food) {
                          console.log("Navigating to /FoodLog/[logDetail] with:", item);                      
                          router.push({
                            pathname: "/FoodLog/logDetailScreen/[logDetail]",
                            params: { logDetail: JSON.stringify(data.search.hints) },
                          });
                        } else {
                          console.error("Invalid item data:", item);
                        }
                      } catch (error) {
                        console.error("Error stringifying item:", error);
                      }
                    }}
                  >
                    <View style={styles.foodCardContent}>
                      <View style={styles.foodImageContainer}>
                        {item.food.image ? (
                          <Image 
                            source={{ uri: item.food.image }} 
                            style={styles.foodImage} 
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.placeholderImage}>
                            <MaterialCommunityIcons name="food-apple" size={30} color="#FF7043" />
                          </View>
                        )}
                      </View>

                      <View style={styles.foodInfo}>
                        <Text style={styles.foodName} numberOfLines={1}>
                          {item.food.label}
                        </Text>
                        
                        <View style={styles.nutrientRow}>
                          <View style={styles.nutrientItem}>
                            <FontAwesome5 name="fire" size={12} color="#FF5722" style={styles.nutrientIcon} />
                            <Text style={styles.nutrientText}>
                              {Math.round(item.food.nutrients.ENERC_KCAL || 0)} cal
                            </Text>
                          </View>
                          
                          <View style={styles.nutrientItem}>
                            <MaterialCommunityIcons name="food-steak" size={12} color="#4FC3F7" style={styles.nutrientIcon} />
                            <Text style={styles.nutrientText}>
                              {Math.round(item.food.nutrients.PROCNT || 0)}g
                            </Text>
                          </View>
                          
                          <View style={styles.nutrientItem}>
                            <MaterialCommunityIcons name="oil" size={12} color="#FFB74D" style={styles.nutrientIcon} />
                            <Text style={styles.nutrientText}>
                              {Math.round(item.food.nutrients.FAT || 0)}g
                            </Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => {
                          try {
                            if (item && item.food) {
                              router.push({
                                pathname: "/FoodLog/logDetailScreen/[logDetail]",
                                params: { logDetail: JSON.stringify(data.search.hints) },
                              });
                            }
                          } catch (error) {
                            console.error("Error navigating:", error);
                          }
                        }}
                      >
                        <Ionicons name="add-circle" size={28} color="#FF7043" />
                      </TouchableOpacity>
                    </View>
                  </Pressable>
                )}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: { 
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 20,
    paddingTop: 15,
    paddingBottom: 25,
  },
  header: { 
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: -20,
    marginBottom: 10,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchBarWrapperFocused: {
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: 50,
  },
  clearButton: {
    padding: 5,
  },
  scanButtonContainer: {
    marginLeft: 10,
  },
  scanButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: "#FF7043",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  scanButtonGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 10,
  },
  errorText: { 
    color: "#f44336",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginVertical: 15,
  },
  sectionHeader: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#333", 
  },
  resultCount: {
    fontSize: 14,
    color: "#777",
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 20,
  },
  foodItemCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  foodCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  foodImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  foodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  nutrientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutrientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  nutrientIcon: {
    marginRight: 4,
  },
  nutrientText: {
    fontSize: 12,
    color: "#555",
    fontWeight: "500",
  },
  addButton: {
    padding: 6,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#777",
    marginTop: 15,
    marginBottom: 5,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#999",
    textAlign: 'center',
    marginHorizontal: 20,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: width * 0.7,
    height: width * 0.3,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  scanInstructions: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 40,
    zIndex: 10,
  },
});

export default App;