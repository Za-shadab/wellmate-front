import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native"
import { router, useNavigation } from "expo-router"
import { Ionicons, MaterialIcons, FontAwesome5, Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ImagePicker from "expo-image-picker"
import { URL } from "../../../constants/url"
import { useNutritionistDetailContext } from "../../context/NutritionistContext"
import axios from 'axios'
import { useFocusEffect } from "@react-navigation/native"

const NutritionistProfileScreen = () => {
  const [profileImage, setProfileImage] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const { nutritionistDetail } = useNutritionistDetailContext({});
  const [loading, setLoading] = useState(false)
  const [nutritionistInfo, setNutritionistInfo] = useState(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState(null)
  const navigation = useNavigation()

  // Function to load nutritionist and subscription info from API
  const loadProfileInfo = async() => {
    console.log("nutasnsgd",nutritionistDetail.userId);
    
    try {
      const response = await axios.post(`${URL}/registration/get-nutri-info`, {
        id: nutritionistDetail.userId
      })
      console.log("mmmmksndfljl",response.data);
      
      setNutritionistInfo(response.data)
      if (response.data.brandlogo) {
        setProfileImage(response.data.brandlogo)
      }
      
      // If we have a user ID, get subscription info
      if (response.data.UserId) {
        const subscriptionResponse = await axios.get(`${URL}/create-subscription/subscription`, {
          params: {id: response.data.UserId}
        });
        
        setSubscriptionInfo(subscriptionResponse.data.subscription)
      }
    } catch (error) {
      console.log("Error fetching nutrition info:", error || error);
      Alert.alert("Error", "Failed to load profile information. Please try again.")
    }
  }

  useFocusEffect(
    useCallback(() => {
      // loadProfileSettings()
      loadProfileInfo()
    }, [])
  )

  // Parse certifications from JSON string
  const getCertifications = () => {
    if (!nutritionistInfo?.certifications) return [];
    
    try {
      return JSON.parse(nutritionistInfo.certifications)
        .filter(cert => cert.isValid)
        .map(cert => cert.value);
    } catch (error) {
      console.log("Error parsing certifications:", error);
      return [];
    }
  }
  
  // Get subscription plan name based on planId
  const getSubscriptionPlanName = () => {
    if (!subscriptionInfo) return "Free";
    
    // Map plan IDs to names (this should be based on your actual plan IDs)
    const planMap = {
      "plan_Q502Oe0iS8YKCq": "Professional",
      // Add other plan mappings as needed
    };
    
    return planMap[subscriptionInfo.planId] || "Standard";
  }
  
  // Calculate renewal date from nextBillingDate (UNIX timestamp in seconds)
  const getFormattedRenewalDate = () => {
    if (!subscriptionInfo?.nextBillingDate) return "N/A";
    
    try {
      const date = new Date(subscriptionInfo.nextBillingDate * 1000);
      return new Intl.DateTimeFormat('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }).format(date);
    } catch (error) {
      return "N/A";
    }
  }
  
  // Get subscription features based on plan
  const getSubscriptionFeatures = () => {
    const plan = getSubscriptionPlanName();
    
    // Define features based on plan names
    const featureMap = {
      "Professional": ["Unlimited Clients", "Custom Meal Plans", "Analytics Dashboard"],
      "Standard": ["Up to 30 Clients", "Basic Meal Plans", "Limited Analytics"],
      "Free": ["Up to 3 Clients", "Basic Features"]
    };
    
    return featureMap[plan] || featureMap["Free"];
  }

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "You need to grant access to your photo library to change your profile picture.",
        )
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri)
        await AsyncStorage.setItem("profileImage", result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to update profile picture. Please try again.")
    }
  }

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          setLoading(true);
          // Simulate logout process
          setTimeout(async () => {
            try {
              // Clear necessary data from AsyncStorage
              await AsyncStorage.removeItem("isLoggedIn");
              
              // Clear nutritionist details
              await AsyncStorage.removeItem("NutritionistDetail");
              
              // If you're using the context in the same component, you can also reset the state
              // If you have access to the updateNutritionistDetail function:
              if (typeof updateNutritionistDetail === 'function') {
                updateNutritionistDetail('userId', '');
                updateNutritionistDetail('nutritionistId', '');
                updateNutritionistDetail('profileUrl', '');
                updateNutritionistDetail('name', '');
              }
              
              // Navigate to login screen
              router.replace("/login");
            } catch (error) {
              console.error("Error during logout:", error);
              Alert.alert("Error", "Failed to log out. Please try again.");
            } finally {
              setLoading(false);
            }
          }, 1000);
        },
        style: "destructive",
      },
    ]);
  };

  const navigateToSubscription = () => {
    // Navigate to subscription management screen
    router.push("/subscription")
  }

  const navigateToEditProfile = () => {
    // Navigate to edit profile screen
    router.push("/edit-profile")
  }

  const navigateToClients = () => {
    // Navigate to subscription list
    // navigation.navigate('quickscreens')
    router.push("/nutriprofile/quickscreens/subscriptions")

  }

  const navigateToAnalytics = () => {
    // Navigate to recipe discovery dashboard
    // router.push("/discovery")
    navigation.navigate('quickscreens')
  }
  
  // Loading state while we fetch data
  if (!nutritionistInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header - Enhanced UI */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
            {profileImage || nutritionistInfo.brandlogo ? (
              <Image 
                source={{ uri: profileImage || nutritionistInfo.brandlogo }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {nutritionistInfo.brandname ? 
                    nutritionistInfo.brandname.substring(0, 2).toUpperCase() : 
                    "NU"}
                </Text>
              </View>
            )}
            <View style={styles.editImageButton}>
              <Feather name="edit-2" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.profileName}>{nutritionistInfo.brandname || "Your Brand"}</Text>
          <Text style={styles.profileSpecialization}>{nutritionistInfo.specialization || "Nutritionist"}</Text>

          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>
                {nutritionistInfo.clients ? nutritionistInfo.clients.length : 0}
              </Text>
              <Text style={styles.profileStatLabel}>Clients</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{nutritionistInfo.experience || "N/A"}</Text>
              <Text style={styles.profileStatLabel}>Experience</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>
                {nutritionistInfo.rating || "4.5"}
              </Text>
              <Text style={styles.profileStatLabel}>Rating</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editProfileButton} onPress={navigateToEditProfile}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Section - Enhanced UI and removed Manage button */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: "#5E60CE" }]}>
              <FontAwesome5 name="crown" size={16} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Subscription</Text>
          </View>

          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <View style={styles.subscriptionPlanContainer}>
                <Text style={styles.subscriptionPlan}>{getSubscriptionPlanName()}</Text>
                <View style={styles.subscriptionStatusContainer}>
                  <View style={[styles.statusDot, { 
                    backgroundColor: subscriptionInfo?.status === "active" ? "#4CAF50" : "#FF9800" 
                  }]} />
                  <Text style={styles.subscriptionStatus}>
                    {subscriptionInfo?.status === "active" ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
              {/* Manage button removed as requested */}
            </View>

            <View style={styles.subscriptionInfo}>
              <View style={styles.renewalContainer}>
                <Feather name="calendar" size={16} color="#666" style={styles.renewalIcon} />
                <Text style={styles.renewalText}>Renews on {getFormattedRenewalDate()}</Text>
              </View>

              <View style={styles.featuresList}>
                {getSubscriptionFeatures().map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: "#FF9800" }]}>
              <Feather name="zap" size={16} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionItem} onPress={navigateToClients}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#E3F2FD" }]}>
                <Feather name="users" size={20} color="#2196F3" />
              </View>
              <Text style={styles.quickActionText}>Subscription</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push("/meal-plans")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#E8F5E9" }]}>
                <MaterialIcons name="restaurant-menu" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.quickActionText}>Custom Recipe</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem} onPress={navigateToAnalytics}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#EDE7F6" }]}>
                <Ionicons name="stats-chart" size={20} color="#673AB7" />
              </View>
              <Text style={styles.quickActionText}>Discover</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push("nutriprofile/quickscreens/collections")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#FFF3E0" }]}>
                <Feather name="calendar" size={20} color="#FF9800" />
              </View>
              <Text style={styles.quickActionText}>Collection</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Professional Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: "#2196F3" }]}>
              <Feather name="briefcase" size={16} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Professional Info</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Feather name="user" size={18} color="#666" />
              <Text style={styles.infoText}>Age: {nutritionistInfo.age || "Not specified"}</Text>
            </View>

            <View style={styles.infoItem}>
              <Feather name="users" size={18} color="#666" />
              <Text style={styles.infoText}>Gender: {nutritionistInfo.gender || "Not specified"}</Text>
            </View>

            <View style={styles.certificationsList}>
              <Text style={styles.certificationsTitle}>Certifications</Text>
              {getCertifications().length > 0 ? (
                getCertifications().map((cert, index) => (
                  <View key={index} style={styles.certificationItem}>
                    <MaterialCommunityIcons name="certificate" size={18} color="#5E60CE" />
                    <Text style={styles.certificationText}>{cert}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noCertificationsText}>No certifications added yet</Text>
              )}
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: "#607D8B" }]}>
              <Ionicons name="settings-outline" size={16} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Settings</Text>
          </View>

          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Feather name="moon" size={18} color="#666" />
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: "#e0e0e0", true: "#4CAF50" }}
                thumbColor={darkMode ? "#fff" : "#fff"}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Feather name="bell" size={18} color="#666" />
                <Text style={styles.settingLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#e0e0e0", true: "#4CAF50" }}
                thumbColor={notifications ? "#fff" : "#fff"}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Feather name="mail" size={18} color="#666" />
                <Text style={styles.settingLabel}>Email Notifications</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: "#e0e0e0", true: "#4CAF50" }}
                thumbColor={emailNotifications ? "#fff" : "#fff"}
              />
            </View>

            <TouchableOpacity style={styles.saveSettingsButton} onPress={()=>{console.log("HII")}}>
              <Text style={styles.saveSettingsButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support & Help */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: "#FF5252" }]}>
              <Feather name="help-circle" size={16} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Support & Help</Text>
          </View>

          <View style={styles.supportCard}>
            <TouchableOpacity style={styles.supportItem} onPress={() => router.push("/help-center")}>
              <Feather name="help-circle" size={18} color="#666" />
              <Text style={styles.supportItemText}>Help Center</Text>
              <Feather name="chevron-right" size={18} color="#ccc" style={styles.supportItemIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.supportItem} onPress={() => router.push("/contact-support")}>
              <Feather name="message-circle" size={18} color="#666" />
              <Text style={styles.supportItemText}>Contact Support</Text>
              <Feather name="chevron-right" size={18} color="#ccc" style={styles.supportItemIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.supportItem} onPress={() => router.push("/privacy-policy")}>
              <Feather name="shield" size={18} color="#666" />
              <Text style={styles.supportItemText}>Privacy Policy</Text>
              <Feather name="chevron-right" size={18} color="#ccc" style={styles.supportItemIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.supportItem} onPress={() => router.push("/terms-of-service")}>
              <Feather name="file-text" size={18} color="#666" />
              <Text style={styles.supportItemText}>Terms of Service</Text>
              <Feather name="chevron-right" size={18} color="#ccc" style={styles.supportItemIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
          {loading ? (
            <Text style={styles.logoutButtonText}>Logging out...</Text>
          ) : (
            <>
              <Feather name="log-out" size={18} color="#FF5252" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  settingsButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  // Enhanced profile header with clean design
  profileHeader: {
    backgroundColor: "#ffffff",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    marginBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  profileImagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#5E60CE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#ffffff",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  profileSpecialization: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 24,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  profileStat: {
    alignItems: "center",
    paddingHorizontal: 15,
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  profileStatLabel: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  profileStatDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#eeeeee",
  },
  editProfileButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  editProfileButtonText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
  },
  // Enhanced subscription card with clean design
  subscriptionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eeeeee",
  },
  subscriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  subscriptionPlanContainer: {
    flexDirection: "column",
  },
  subscriptionPlan: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  subscriptionStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subscriptionStatus: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  subscriptionInfo: {
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 16,
  },
  renewalContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  renewalIcon: {
    marginRight: 8,
  },
  renewalText: {
    fontSize: 14,
    color: "#666666",
  },
  featuresList: {
    marginTop: 8,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 10,
    fontWeight: "500",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  quickActionItem: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 12,
  },
  certificationsList: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 16,
  },
  certificationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  certificationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  certificationText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 10,
  },
  noCertificationsText: {
    fontSize: 14,
    color: "#999999",
    fontStyle: "italic",
    marginLeft: 10,
  },
  settingsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 12,
  },
  saveSettingsButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  saveSettingsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  supportCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  supportItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  supportItemText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 12,
    flex: 1,
  },
  supportItemIcon: {
    marginLeft: "auto",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F5",
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5252",
    marginLeft: 8,
  },
  versionInfo: {
    alignItems: "center",
    marginTop: 20,
  },
  versionText: {
    fontSize: 12,
    color: "#999999",
  },
  bottomPadding: {
    height: 40,
  },
})

export default NutritionistProfileScreen