import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  Switch, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Animated, 
  Easing,
  StatusBar,
  SafeAreaView
} from "react-native";
import { router } from "expo-router";
import { useRegistrationContext } from '../context/RegistrationContext';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo/vector-icons if not already

const ClientPermissionsScreen = ({ navigation }) => {
  const { registrationData, updateRegistrationData } = useRegistrationContext({});
  const [permissions, setPermissions] = useState({
    viewPlanner: true,
    allowFoodLogging: false,
    regenerateMeals: true,
    saveLoadPlans: true,
    addDeleteFoods: false,
    editFoodAmounts: true,
    setRecurringFoods: true,
    editAllSettings: false,
    editLoginCredentials: false,
    sendMealPlanEmail: true,
    viewReports: true,
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const switchAnims = useRef(
    Object.keys(permissions).reduce((acc, key) => {
      acc[key] = new Animated.Value(permissions[key] ? 1 : 0);
      return acc;
    }, {})
  ).current;

  // Run entrance animation on component mount
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  const togglePermission = (key) => {
    // Update state
    setPermissions(prev => {
      const newValue = !prev[key];
      
      // Animate the switch change
      Animated.timing(switchAnims[key], {
        toValue: newValue ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.cubic),
      }).start();
      
      return { ...prev, [key]: newValue };
    });
  };

  const handleSubmit = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log("Selected Permissions:", permissions);
      updateRegistrationData('permissions', permissions);
      router.replace("profilePicker");
    });
  };

  // Helper function to get description for each permission
  const getPermissionDescription = (key) => {
    const descriptions = {
      viewPlanner: "Access to view meal planning calendar",
      allowFoodLogging: "Record daily food consumption",
      regenerateMeals: "Create new meal plans automatically",
      saveLoadPlans: "Save and retrieve meal plans",
      addDeleteFoods: "Add or remove food items from database",
      editFoodAmounts: "Modify portion sizes and quantities",
      setRecurringFoods: "Schedule regular meals",
      editAllSettings: "Change all application settings",
      editLoginCredentials: "Modify account access information",
      sendMealPlanEmail: "Email meal plans to client",
      viewReports: "Access nutrition and progress reports",
    };
    return descriptions[key] || "";
  };

  // Group permissions into categories
  const permissionCategories = {
    "Meal Planning": ["viewPlanner", "regenerateMeals", "saveLoadPlans", "sendMealPlanEmail"],
    "Food Management": ["allowFoodLogging", "addDeleteFoods", "editFoodAmounts", "setRecurringFoods"],
    "Account Access": ["editAllSettings", "editLoginCredentials", "viewReports"],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <Animated.View 
        style={[
          styles.headerContainer, 
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Text style={styles.title}>Client Permissions</Text>
        <Text style={styles.subtitle}>
          Control what your clients can access and modify
        </Text>
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(permissionCategories).map(([category, keys], categoryIndex) => (
          <Animated.View 
            key={category}
            style={[
              styles.categoryContainer,
              { 
                opacity: fadeAnim, 
                transform: [{ 
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  }) 
                }] 
              }
            ]}
          >
            <Text style={styles.categoryTitle}>{category}</Text>
            
            {keys.map((key, index) => (
              <Animated.View 
                key={key} 
                style={[
                  styles.permissionCard,
                  { 
                    transform: [{ 
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1]
                      }) 
                    }],
                    opacity: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                      extrapolate: 'clamp'
                    }),
                  }
                ]}
              >
                <View style={styles.permissionInfo}>
                  <Text style={styles.label}>{formatLabel(key)}</Text>
                  <Text style={styles.description}>{getPermissionDescription(key)}</Text>
                </View>
                
                <View style={styles.switchContainer}>
                  <Animated.View
                    style={[
                      styles.switchBackground,
                      {
                        backgroundColor: switchAnims[key].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['#E2E8F0', '#4CAF50']
                        })
                      }
                    ]}
                  />
                  <Switch
                    value={permissions[key]}
                    onValueChange={() => togglePermission(key)}
                    trackColor={{ false: "#E2E8F0", true: "#4CAF50" }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#E2E8F0"
                    style={styles.switch}
                  />
                </View>
              </Animated.View>
            ))}
          </Animated.View>
        ))}

        <Animated.View 
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.saveButtonText}>Save & Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function to format keys into readable labels
const formatLabel = (key) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#F8FAFC",
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 16,
    letterSpacing: 0.1,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
    marginLeft: 4,
  },
  permissionCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  permissionInfo: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  switchContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchBackground: {
    position: 'absolute',
    width: 50,
    height: 30,
    borderRadius: 15,
    zIndex: -1,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  buttonContainer: {
    marginTop: 16,
    paddingVertical: 8,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginRight: 8,
    letterSpacing: 0.5,
  },
});

export default ClientPermissionsScreen;