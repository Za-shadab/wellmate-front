import { useState, useEffect, useCallback, useRef } from "react";
import { 
  StyleSheet, 
  View, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StatusBar, 
  Image, 
  Pressable,
  Animated,
  Dimensions
} from "react-native";
import {
  Provider as PaperProvider,
  DefaultTheme,
  Button,
  Title,
  Paragraph,
  Modal,
  Portal,
  Text,
  Avatar,
  Divider,
  ActivityIndicator
} from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5, EvilIcons, MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useNutritionistDetailContext } from '../../context/NutritionistContext';
import { useClientRegistrationContext } from "../../context/ClientRegistration";
import { URL } from "@/src/constants/url";


const { width } = Dimensions.get('window');

// Custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50',
    accent: '#63BEEA',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#1F2937',
    placeholder: '#9CA3AF',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  roundness: 12,
};

export default function App() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const router = useRouter();
  const navigation = useNavigation();
  const { nutritionistDetail } = useNutritionistDetailContext({});
  const { ClientregistrationData, updateClientRegistrationData } = useClientRegistrationContext({});
  const [clientsList, setClientsList] = useState([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Animation for list items
  const listAnimatedValues = useRef({}).current;

  // Run entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    console.log(".......................................",nutritionistDetail);
  }, [fadeAnim, scaleAnim]);

  const getclients = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${URL}/api/get-client`, {
        NutritionistId: nutritionistDetail.nutritionistId
      });
      
      const clients = response.data.clientUsers.map((client) => {
        return {
          id: client._id,
          name: client.name,
          email: client.email,
          plan: 'sample',
          profileimg: require("../../../../assets/images/Frame__1_-removebg-preview.png")
        };
      });
      
      setClientsList(clients);
      setFilteredClients(clients);
      
      // Initialize animation values for new clients
      clients.forEach((client, index) => {
        if (!listAnimatedValues[client.id]) {
          listAnimatedValues[client.id] = {
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(20)
          };
          
          // Start animation with delay based on index
          const delay = index * 100;
          Animated.parallel([
            Animated.timing(listAnimatedValues[client.id].opacity, {
              toValue: 1,
              duration: 400,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(listAnimatedValues[client.id].translateY, {
              toValue: 0,
              duration: 400,
              delay,
              useNativeDriver: true,
            }),
          ]).start();
        }
      });
      
    } catch (error) {
      console.log("Error fetching clients:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  const deleteClient = async (selectedClient) => {
    try {
      // Show loading state
      setIsLoading(true);
      
      const response = await axios.post(
        `${URL}/create/delete-client-nutritional-profile`, 
        { id: selectedClient.id }
      );
      
      if (response.data.success) {
        setModalVisible(false);
        getclients();
      } else {
        console.error('Failed to delete client:', response.data.message);
      }
    } catch (error) {
      console.error('Error deleting client:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input changes
  const handleSearch = (text) => {
    setSearchTerm(text);
    
    if (text.trim() === '') {
      setFilteredClients(clientsList);
    } else {
      const filtered = clientsList.filter(client => 
        client.name.toLowerCase().includes(text.toLowerCase()) || 
        client.email.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getclients();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getclients();
    }, [])
  );

  // Update filtered clients when clientsList changes
  useEffect(() => {
    setFilteredClients(clientsList);
  }, [clientsList]);

  const renderCardItem = ({ item }) => {
    // Use the pre-created animated values for this item
    const animatedValues = listAnimatedValues[item.id] || { 
      opacity: new Animated.Value(1), 
      translateY: new Animated.Value(0) 
    };
    
    return (
      <Animated.View
        style={{
          opacity: animatedValues.opacity,
          transform: [{ translateY: animatedValues.translateY }],
        }}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            setSelectedClient(item);
            setModalVisible(true);
            updateClientRegistrationData('id', item.id);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarContainer}>
                <Image source={item.profileimg} style={styles.avatar} resizeMode="contain" />
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{item.name}</Text>
                <Text style={styles.clientEmail}>{item.email}</Text>
              </View>
              <TouchableOpacity style={styles.notificationContainer}>
                <FontAwesome5 name="bell" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.cardFooter}>
              <View style={styles.planContainer}>
                <Text style={styles.planLabel}>Plan:</Text>
                <View style={[
                  styles.planBadge, 
                  { backgroundColor: item.plan === "Premium" ? "#FEF3C7" : "#F3F4F6" }
                ]}>
                  <Text style={[
                    styles.planText, 
                    { color: item.plan === "Premium" ? "#92400E" : "#4B5563" }
                  ]}>
                    {item.plan}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View</Text>
                <Feather name="chevron-right" size={16} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="account-search-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyText}>No clients found</Text>
      <Text style={styles.emptySubtext}>
        {searchTerm ? "Try a different search term" : "Add your first client to get started"}
      </Text>
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.profileContainer}>
                  <Image
                    source={{uri: nutritionistDetail.profileUrl}}
                    style={styles.profileImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.welcomeContainer}>
                  <Text style={styles.welcomeText}>Welcome back,</Text>
                  <Text style={styles.userName}>Fake Charc</Text>
                </View>
              </View>
              <Pressable style={styles.notificationButton}
                onPress={() => {
                  navigation.navigate("notification");
                }
              }
              >
                <Ionicons name="notifications-outline" size={22} color="#4B5563" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </Pressable>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <EvilIcons name="search" size={24} color="#9CA3AF" />
              <TextInput 
                style={styles.searchInput} 
                placeholder="Search clients by name or email..." 
                placeholderTextColor="#9CA3AF"
                value={searchTerm}
                onChangeText={handleSearch}
              />
              {searchTerm ? (
                <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Button
                icon={({ size, color }) => (
                  <MaterialCommunityIcons name="account-plus-outline" size={size} color={color} />
                )}
                style={[styles.actionButton, styles.inviteButton]}
                labelStyle={styles.actionButtonLabel}
                mode="contained"
                onPress={() => {
                  navigation.navigate("(clientonboard)");
                }}
              >
                Invite Client
              </Button>
              <Button
                icon={({ size, color }) => (
                  <Feather name="plus" size={size} color={color} />
                )}
                style={[styles.actionButton, styles.addButton]}
                labelStyle={styles.actionButtonLabel}
                mode="contained"
                onPress={() => {
                  navigation.navigate("(clientonboard)");
                }}
              >
                Add Client
              </Button>
            </View>

            {/* Client List */}
            {isLoading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading clients...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredClients}
                renderItem={renderCardItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.clientList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={EmptyListComponent}
                onRefresh={onRefresh}
                refreshing={refreshing}
              />
            )}
          </Animated.View>

          {/* Client Details Modal */}
          <Portal>
            <Modal 
              visible={modalVisible} 
              onDismiss={() => setModalVisible(false)} 
              contentContainerStyle={styles.modal}
            >
              {selectedClient && (
                <Animated.View 
                  style={{
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                  }}
                >
                  <View style={styles.modalHeader}>
                    <View style={styles.modalAvatarContainer}>
                      <Image source={selectedClient.profileimg} style={styles.modalAvatar} resizeMode="contain" />
                    </View>
                    <View style={styles.modalClientInfo}>
                      <Title style={styles.modalTitle}>{selectedClient.name}</Title>
                      <Text style={styles.modalEmail}>{selectedClient.email}</Text>
                    </View>
                  </View>
                  
                  <Divider style={styles.modalDivider} />
                  
                  <View style={styles.modalPlanContainer}>
                    <Text style={styles.modalPlanLabel}>Current Plan:</Text>
                    <View style={[
                      styles.modalPlanBadge, 
                      { backgroundColor: selectedClient.plan === "Premium" ? "#FEF3C7" : "#F3F4F6" }
                    ]}>
                      <Text style={[
                        styles.modalPlanText, 
                        { color: selectedClient.plan === "Premium" ? "#92400E" : "#4B5563" }
                      ]}>
                        {selectedClient.plan}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalActions}>
                    <Button 
                      style={styles.modalButton} 
                      mode="contained" 
                      icon={({ size, color }) => (
                        <Feather name="user" size={size-2} color={color} />
                      )}
                      onPress={() => {
                        setModalVisible(false);
                        router.push({
                          pathname:'/(nutritionclient)/[profile]',
                          params:{clientId: selectedClient.id}
                        });
                      }}
                    > 
                      View Profile
                    </Button>
                    
                    {/* <Button 
                      style={styles.modalButton} 
                      mode="outlined" 
                      icon={({ size, color }) => (
                        <Feather name="edit-2" size={size-2} color={color} />
                      )}
                      onPress={() => console.log("Edit")}
                    >
                      Edit Details
                    </Button> */}
                    
                    <Button
                      style={[styles.modalButton, styles.deleteButton]}
                      textColor="#DC2626"
                      mode="outlined"
                      icon={({ size, color }) => (
                        <Feather name="trash-2" size={size-2} color={color} />
                      )}
                      onPress={() => deleteClient(selectedClient)}
                    >
                      Delete Client
                    </Button>
                  </View>
                </Animated.View>
              )}
            </Modal>
          </Portal>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileContainer: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileImage: {
    height: "60%",
    aspectRatio: 1,
  },
  welcomeContainer: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  notificationButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#1F2937",
    height: "100%",
  },
  clearButton: {
    padding: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    paddingVertical: 4,
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.25,
  },
  inviteButton: {
    backgroundColor: "#63BEEA",
  },
  addButton: {
    backgroundColor: "#4CAF50",
  },
  clientList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatar: {
    height: "100%",
    aspectRatio: 1,
  },
  clientInfo: {
    marginLeft: 12,
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 13,
    color: "#6B7280",
  },
  notificationContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  divider: {
    marginVertical: 12,
    backgroundColor: "#F3F4F6",
    height: 1,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  planLabel: {
    fontSize: 13,
    color: "#4B5563",
    marginRight: 8,
  },
  planBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  planText: {
    fontSize: 12,
    fontWeight: "500",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4CAF50",
    marginRight: 2,
  },
  modal: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 16,
    padding: 0,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  modalAvatarContainer: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalAvatar: {
    height: "100%",
    aspectRatio: 1,
  },
  modalClientInfo: {
    marginLeft: 16,
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  modalEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  modalDivider: {
    backgroundColor: "#E5E7EB",
    height: 1,
  },
  modalPlanContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  modalPlanLabel: {
    fontSize: 15,
    color: "#4B5563",
    marginRight: 8,
    fontWeight: "500",
  },
  modalPlanBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  modalPlanText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalActions: {
    padding: 20,
    paddingTop: 0,
  },
  modalButton: {
    marginTop: 12,
    borderRadius: 12,
  },
  deleteButton: {
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    maxWidth: 240,
  },
});