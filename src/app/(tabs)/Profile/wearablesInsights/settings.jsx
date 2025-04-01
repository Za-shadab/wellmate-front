import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Animated,
  Dimensions,
  Alert,
} from "react-native"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import axios from "axios"
import { Picker } from "@react-native-picker/picker"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { URL } from "../../../../constants/url"
import { useuserDetailContext } from "../../../context/UserDetailContext"

const { width } = Dimensions.get("window")

// Replace with your actual API URL
const API_URL = URL;

const UserProfileScreen = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)
  const {userDetail} = useuserDetailContext();

  const [profile, setProfile] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "Male",
    activityLevel: "Lightly Active",
    goals: ["Maintain Weight"],
    goalWeight: "",
    weightchangeRate: "0.5",
    macros: null,
    bmi: "",
    bmr: "",
    tdee: "",
  })

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  // Activity level options
  const activityLevels = ["Sedentary", "Lightly Active", "Moderately Active", "Very Active", "Extremely Active"]

  // Goal options
  const goalOptions = ["Lose Weight", "Maintain Weight", "Gain Weight", "Build Muscle", "Improve Fitness"]

  // Gender options
  const genderOptions = ["Male", "Female"]

  // Weight change rate options
  const weightChangeRates = ["0.25", "0.5", "0.75", "1.0"]

  useEffect(() => {
    loadUserId()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchUserProfile()
    }
  }, [userId])

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [loading, fadeAnim, slideAnim])

  const loadUserId = async () => {
    try {
      // In a real app, you would get this from your auth system
      const id = userDetail.userId;
      console.log(id);
      
      if (id) {
        setUserId(id)
      } else {
        // For demo purposes, set a default ID
        setUserId("123456")
      }
    } catch (err) {
      console.error("Error loading user ID", err)
      setUserId("123456") // Fallback for demo
    }
  }

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch user profile data from the API
      const response = await axios.get(`${API_URL}/regular/regular-users/${userId}`)

      if (response.status === 200 && response.data.regularUser) {
        const userData = response.data.regularUser
        
        // Map API data to profile state
        setProfile({
          age: userData.age || "",
          height: userData.height || "",
          weight: userData.weight || "",
          gender: userData.gender || "Male",
          activityLevel: userData.activityLevel || "Lightly Active",
          goals: userData.goals || ["Maintain Weight"],
          goalWeight: userData.goalWeight || userData.weight || "",
          weightchangeRate: userData.goals.includes("Maintain Weight") ? "None" : "0.5",
          // Store additional data from API
          macros: userData.macros || null,
          bmi: userData.bmi || "",
          bmr: userData.bmr || "",
          tdee: userData.tdee || "",
        })
      } else {
        setError("Failed to load profile.")
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError("An error occurred while loading your profile.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setError(null)

      // Validate inputs
      if (!profile.age || !profile.height || !profile.weight) {
        Alert.alert("Validation Error", "Please fill in all required fields")
        setSaving(false)
        return
      }

      // Format the data according to your API requirements
      const updateData = {
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        gender: profile.gender,
        activityLevel: profile.activityLevel,
        goals: profile.goals,
        goalWeight: profile.goalWeight || profile.weight,
        weightchangeRate: profile.weightchangeRate,
      }

      // Send update request to your API
      const response = await axios.put(`${API_URL}/regular/update/${userId}`, updateData)

      if (response.status === 200) {
        setEditMode(false)
        Alert.alert("Success", "Profile updated successfully")
        // Refresh the profile data
        fetchUserProfile()
      } else {
        setError("Failed to update profile.")
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("An error occurred while updating your profile.")
    } finally {
      setSaving(false)
    }
  }

  const toggleGoal = (goal) => {
    const currentGoals = [...profile.goals]

    if (currentGoals.includes(goal)) {
      // Remove goal if already selected
      setProfile({
        ...profile,
        goals: currentGoals.filter((g) => g !== goal),
      })
    } else {
      // Add goal if not already selected
      setProfile({
        ...profile,
        goals: [...currentGoals, goal],
      })
    }
  }

  const formatValue = (key, value) => {
    switch (key) {
      case "height":
        return `${value} cm`
      case "weight":
      case "goalWeight":
        return `${value} kg`
      case "weightchangeRate":
        return `${value} kg/week`
      default:
        return value
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </View>
    )
  }

  if (error && !profile) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={60} color="#FF5252" style={styles.errorIcon} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchUserProfile} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#4CAF50", "#2E7D32"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(!editMode)} disabled={saving}>
            <Text style={styles.editButtonText}>{editMode ? "Cancel" : "Edit Profile"}</Text>
            <MaterialIcons name={editMode ? "close" : "edit"} size={16} color="#FFFFFF" style={styles.editIcon} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.profileContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Basic Information Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={22} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Age</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  value={profile.age}
                  onChangeText={(text) => setProfile({ ...profile, age: text })}
                  keyboardType="number-pad"
                  placeholder="Enter your age"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.age} years</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Gender</Text>
              {editMode ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={profile.gender}
                    onValueChange={(value) => setProfile({ ...profile, gender: value })}
                    style={styles.picker}
                  >
                    {genderOptions.map((option) => (
                      <Picker.Item key={option} label={option} value={option} />
                    ))}
                  </Picker>
                </View>
              ) : (
                <Text style={styles.fieldValue}>{profile.gender}</Text>
              )}
            </View>
          </View>

          {/* Body Measurements Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="straighten" size={22} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Body Measurements</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Height</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  value={profile.height}
                  onChangeText={(text) => setProfile({ ...profile, height: text })}
                  keyboardType="number-pad"
                  placeholder="Enter your height (cm)"
                />
              ) : (
                <Text style={styles.fieldValue}>{formatValue("height", profile.height)}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Weight</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  value={profile.weight}
                  onChangeText={(text) => setProfile({ ...profile, weight: text })}
                  keyboardType="number-pad"
                  placeholder="Enter your weight (kg)"
                />
              ) : (
                <Text style={styles.fieldValue}>{formatValue("weight", profile.weight)}</Text>
              )}
            </View>

            {profile.bmi && (
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>BMI</Text>
                <Text style={styles.fieldValue}>{profile.bmi}</Text>
              </View>
            )}
          </View>

          {/* Activity & Lifestyle Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="directions-run" size={22} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Activity & Lifestyle</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Activity Level</Text>
              {editMode ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={profile.activityLevel}
                    onValueChange={(value) => setProfile({ ...profile, activityLevel: value })}
                    style={styles.picker}
                  >
                    {activityLevels.map((level) => (
                      <Picker.Item key={level} label={level} value={level} />
                    ))}
                  </Picker>
                </View>
              ) : (
                <Text style={styles.fieldValue}>{profile.activityLevel}</Text>
              )}
            </View>

            {profile.bmr && (
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Basal Metabolic Rate (BMR)</Text>
                <Text style={styles.fieldValue}>{profile.bmr} calories/day</Text>
              </View>
            )}

            {profile.tdee && (
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Total Daily Energy Expenditure (TDEE)</Text>
                <Text style={styles.fieldValue}>{profile.tdee} calories/day</Text>
              </View>
            )}
          </View>

          {/* Goals Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="flag" size={22} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Fitness Goals</Text>
            </View>

            {editMode ? (
              <View style={styles.goalsContainer}>
                {goalOptions.map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[styles.goalChip, profile.goals.includes(goal) && styles.goalChipSelected]}
                    onPress={() => toggleGoal(goal)}
                  >
                    <Text style={[styles.goalChipText, profile.goals.includes(goal) && styles.goalChipTextSelected]}>
                      {goal}
                    </Text>
                    {profile.goals.includes(goal) && (
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={styles.goalCheckIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.goalsDisplayContainer}>
                {profile.goals.map((goal) => (
                  <View key={goal} style={styles.goalDisplayChip}>
                    <Text style={styles.goalDisplayText}>{goal}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Goal Weight</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  value={profile.goalWeight}
                  onChangeText={(text) => setProfile({ ...profile, goalWeight: text })}
                  keyboardType="number-pad"
                  placeholder="Enter your goal weight (kg)"
                />
              ) : (
                <Text style={styles.fieldValue}>{formatValue("goalWeight", profile.goalWeight)}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Weight Change Rate</Text>
              {editMode ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={profile.weightchangeRate}
                    onValueChange={(value) => setProfile({ ...profile, weightchangeRate: value })}
                    style={styles.picker}
                  >
                    {weightChangeRates.map((rate) => (
                      <Picker.Item key={rate} label={`${rate} kg/week`} value={rate} />
                    ))}
                  </Picker>
                </View>
              ) : (
                <Text style={styles.fieldValue}>{formatValue("weightchangeRate", profile.weightchangeRate)}</Text>
              )}
            </View>
          </View>

          {/* Nutrition Macros Section */}
          {profile.macros && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="restaurant" size={22} color="#4CAF50" />
                <Text style={styles.sectionTitle}>Nutrition Macros</Text>
              </View>

              <View style={styles.macrosContainer}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{profile.macros.protein}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{profile.macros.carbs}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{profile.macros.fats}g</Text>
                  <Text style={styles.macroLabel}>Fats</Text>
                </View>
              </View>

              <View style={styles.macrosDetailContainer}>
                <View style={styles.macroDetailItem}>
                  <Text style={styles.macroDetailLabel}>Fiber:</Text>
                  <Text style={styles.macroDetailValue}>{profile.macros.fiber}g</Text>
                </View>
                <View style={styles.macroDetailItem}>
                  <Text style={styles.macroDetailLabel}>Non-Fiber Carbs:</Text>
                  <Text style={styles.macroDetailValue}>{profile.macros.nonFiberCarbs}g</Text>
                </View>
              </View>

              <View style={styles.caloriesContainer}>
                <Text style={styles.caloriesLabel}>Daily Calories:</Text>
                <Text style={styles.caloriesValue}>
                    {profile.macros.calories?.total || profile.tdee || "N/A"}
                </Text>
              </View>
            </View>
          )}

          {/* Save Button */}
          {editMode && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                  <MaterialIcons name="check" size={20} color="#FFFFFF" style={styles.saveIcon} />
                </>
              )}
            </TouchableOpacity>
          )}

          {error && (
            <View style={styles.errorMessage}>
              <MaterialIcons name="error-outline" size={20} color="#FF5252" />
              <Text style={styles.errorMessageText}>{error}</Text>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    paddingTop: Platform.OS === "android" ? 40 : 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    marginRight: 6,
  },
  editIcon: {
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginLeft: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#F9F9F9",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  goalsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  goalChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  goalChipSelected: {
    backgroundColor: "#4CAF50",
  },
  goalChipText: {
    color: "#333333",
    fontWeight: "500",
  },
  goalChipTextSelected: {
    color: "#FFFFFF",
  },
  goalCheckIcon: {
    marginLeft: 4,
  },
  goalsDisplayContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  goalDisplayChip: {
    backgroundColor: "#E8F5E9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  goalDisplayText: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  saveIcon: {
    marginLeft: 4,
  },
  errorMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorMessageText: {
    color: "#FF5252",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingContent: {
    alignItems: "center",
    padding: 30,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#FF5252",
    marginBottom: 24,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  bottomPadding: {
    height: 40,
  },
  // New styles for macros section
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 10,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 14,
    color: '#666666',
  },
  macrosDetailContainer: {
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
  },
  macroDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  macroDetailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  macroDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  caloriesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  caloriesLabel: {
    fontSize: 16,
    color: '#333333',
    marginRight: 8,
  },
  caloriesValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
})

export default UserProfileScreen