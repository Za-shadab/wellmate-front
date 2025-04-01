import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useuserDetailContext } from "../../../context/UserDetailContext";
import axios from "axios";
import LottieView from "lottie-react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { URL } from "../../../../constants/url";

const BarcodeFoodLogScreen = () => {
  const { barcodeData } = useLocalSearchParams();
  console.log(barcodeData);
  
  const foodData = JSON.parse(barcodeData);
  const { userDetail } = useuserDetailContext();

  const [selectedMeasure, setSelectedMeasure] = useState(
    foodData.measures?.[0]?.label || "Serving"
  );
  const [quantity, setQuantity] = useState("1");
  const [mealType, setMealType] = useState("Breakfast");
  const [successModal, setSuccessModal] = useState(false);
  const [activeMealType, setActiveMealType] = useState("Breakfast");
  const router = useRouter();

  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Spin animation
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const calculateNutrient = (nutrient) => {
    if (!nutrient) return "N/A";
    const weight =
      foodData.measures?.find((m) => m.label === selectedMeasure)?.weight || 1;
    return ((nutrient / 100) * weight * parseFloat(quantity)).toFixed(2);
  };

  const handleMealTypeSelect = (type) => {
    setActiveMealType(type);
    setMealType(type);
  };

  const handleAddToLog = () => {
    // Spin animation when button is pressed
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true
    }).start(() => {
      spinAnim.setValue(0);
      
      const foodLogEntry = {
        regularUserId: userDetail.regularId,
        foodId: foodData.food.foodId,
        foodName: foodData.food.label,
        measure: selectedMeasure,
        quantity: parseFloat(quantity),
        mealType,
        calories: `${calculateNutrient(
          foodData.food.nutrients?.ENERC_KCAL
        )} Kcal`,
        protein: `${calculateNutrient(foodData.food.nutrients?.PROCNT)} g`,
        fats: `${calculateNutrient(foodData.food.nutrients?.FAT)} g`,
        fiber: `${calculateNutrient(foodData.food.nutrients?.FIBTG)} g`,
        carbs: `${calculateNutrient(foodData.food.nutrients?.CHOCDF)}g`,
        sugar: `${calculateNutrient(foodData.food.nutrients?.SUGAR)}g`,
        cholestrol: `${calculateNutrient(foodData.food.nutrients?.CHOLE)}mg`,
        iron: `${calculateNutrient(foodData.food.nutrients?.FE)}mg`,
        magnesium: `${calculateNutrient(foodData.food.nutrients?.MG)}mg`,
        potassium: `${calculateNutrient(foodData.food.nutrients?.K)}mg`,
        sodium: `${calculateNutrient(foodData.food.nutrients?.NA)}mg`,
        zinc: `${calculateNutrient(foodData.food.nutrients?.ZN)}mg`,
        vitaminB12: `${calculateNutrient(foodData.food.nutrients?.VITB12)}mg`,
        VitaminB6: `${calculateNutrient(foodData.food.nutrients?.VITB6A)}mg`,
        VitaminC: `${calculateNutrient(foodData.food.nutrients?.VITC)}mg`,
        VitaminD: `${calculateNutrient(foodData.food.nutrients?.VITD)}mg`,
        thiamin: `${calculateNutrient(foodData.food.nutrients?.THIA)}mg`,
      };

      axios.post(`${URL}/foodlog/add`, foodLogEntry, {
          headers: { "Content-Type": "application/json" },
        })
        .then(() => {
          setSuccessModal(true);
          setTimeout(() => setSuccessModal(false), 2000);
        })
        .catch((error) => console.error("Error logging food:", error));
    });
  };

  const renderMealTypeButton = (type, icon) => {
    const isActive = activeMealType === type;
    return (
      <TouchableOpacity
        style={[
          styles.mealTypeButton,
          isActive && styles.mealTypeButtonActive
        ]}
        onPress={() => handleMealTypeSelect(type)}
      >
        <MaterialCommunityIcons 
          name={icon} 
          size={22} 
          color={isActive ? "#fff" : "#555"} 
        />
        <Text 
          style={[
            styles.mealTypeText,
            isActive && styles.mealTypeTextActive
          ]}
        >
          {type}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoid}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.container, 
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          
          <View style={styles.header}>
            <LinearGradient
              colors={['#FF9800', '#FF5722']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerGradient}
            >
          <TouchableOpacity onPress={()=>{router.push('/FoodLog')}} style={{ padding: 10 }}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>{foodData.food.label}</Text>
                <Text style={styles.headerSubtitle}>Nutrition Information</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.cardContainer}>
            {/* Nutrition Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="nutrition" size={22} color="#FF7043" />
                <Text style={styles.cardTitle}>Nutritional Value</Text>
              </View>
              
              <View style={styles.nutrientGrid}>
                <View style={styles.nutrientItem}>
                  <View style={[styles.nutrientIcon, { backgroundColor: '#FF5722' }]}>
                    <FontAwesome5 name="fire" size={16} color="#fff" />
                  </View>
                  <View style={styles.nutrientInfo}>
                    <Text style={styles.nutrientValue}>
                      {calculateNutrient(foodData.food.nutrients?.ENERC_KCAL)}
                    </Text>
                    <Text style={styles.nutrientLabel}>Calories</Text>
                  </View>
                </View>
                
                <View style={styles.nutrientItem}>
                  <View style={[styles.nutrientIcon, { backgroundColor: '#4FC3F7' }]}>
                    <MaterialCommunityIcons name="food-steak" size={16} color="#fff" />
                  </View>
                  <View style={styles.nutrientInfo}>
                    <Text style={styles.nutrientValue}>
                      {calculateNutrient(foodData.food.nutrients?.PROCNT)} g
                    </Text>
                    <Text style={styles.nutrientLabel}>Protein</Text>
                  </View>
                </View>
                
                <View style={styles.nutrientItem}>
                  <View style={[styles.nutrientIcon, { backgroundColor: '#FFB74D' }]}>
                    <MaterialCommunityIcons name="oil" size={16} color="#fff" />
                  </View>
                  <View style={styles.nutrientInfo}>
                    <Text style={styles.nutrientValue}>
                      {calculateNutrient(foodData.food.nutrients?.FAT)} g
                    </Text>
                    <Text style={styles.nutrientLabel}>Fats</Text>
                  </View>
                </View>
                
                <View style={styles.nutrientItem}>
                  <View style={[styles.nutrientIcon, { backgroundColor: '#81C784' }]}>
                    <MaterialCommunityIcons name="grain" size={16} color="#fff" />
                  </View>
                  <View style={styles.nutrientInfo}>
                    <Text style={styles.nutrientValue}>
                      {calculateNutrient(foodData.food.nutrients?.FIBTG)} g
                    </Text>
                    <Text style={styles.nutrientLabel}>Fiber</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Logging Options Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="options-outline" size={22} color="#FF7043" />
                <Text style={styles.cardTitle}>Logging Options</Text>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Serving Size</Text>
                <View style={styles.pickerContainer}>
                  {foodData.measures?.map((measure) => (
                    <TouchableOpacity
                      key={measure.label}
                      style={[
                        styles.measureButton,
                        selectedMeasure === measure.label && styles.measureButtonActive
                      ]}
                      onPress={() => setSelectedMeasure(measure.label)}
                    >
                      <Text
                        style={[
                          styles.measureButtonText,
                          selectedMeasure === measure.label && styles.measureButtonTextActive
                        ]}
                      >
                        {measure.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Quantity</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => setQuantity(Math.max(0.5, parseFloat(quantity || 1) - 0.5).toString())}
                  >
                    <MaterialCommunityIcons name="minus" size={20} color="#FF7043" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => setQuantity((parseFloat(quantity || 1) + 0.5).toString())}
                  >
                    <MaterialCommunityIcons name="plus" size={20} color="#FF7043" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Meal Type</Text>
                <View style={styles.mealTypeContainer}>
                  {renderMealTypeButton("Breakfast", "food-apple")}
                  {renderMealTypeButton("Lunch", "food")}
                  {renderMealTypeButton("Dinner", "food-turkey")}
                  {renderMealTypeButton("Snack", "cookie")}
                </View>
              </View>
            </View>

            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddToLog}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF9800', '#FF5722']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.addButtonText}>Add to Food Log</Text>
                  <MaterialCommunityIcons name="playlist-plus" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Success Animation Modal */}
      <Modal visible={successModal} transparent={true} animationType="none">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LottieView
              source={require("../../../../../assets/animation/Animation - 1739003175068.json")}
              autoPlay
              loop={false}
              style={styles.lottie}
            />
            <Text style={styles.successText}>Food Logged Successfully!</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#fff9f5'
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff9f5',
  },
  header: {
    height: 160,
    width: '100%',
    overflow: 'hidden',
  },
  headerGradient: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
  },
  headerContent: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  cardContainer: {
    padding: 16,
    marginTop: -30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  nutrientItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 245, 235, 0.7)',
    padding: 12,
    borderRadius: 12,
  },
  nutrientIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  nutrientInfo: {
    flex: 1,
  },
  nutrientValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  nutrientLabel: {
    fontSize: 14,
    color: '#666',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  measureButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  measureButtonActive: {
    backgroundColor: '#FF7043',
  },
  measureButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  measureButtonTextActive: {
    color: '#fff',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    backgroundColor: '#f5f5f5',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 10,
    paddingHorizontal: 20,
    width: 100,
    textAlign: 'center',
    borderRadius: 22,
    marginHorizontal: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#fff',
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    marginHorizontal: 4,
    marginBottom: 8,
    minWidth: '22%',
    justifyContent: 'center',
  },
  mealTypeButtonActive: {
    backgroundColor: '#FF7043',
  },
  mealTypeText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 13,
    marginLeft: 4,
  },
  mealTypeTextActive: {
    color: '#fff',
  },
  addButton: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#FF7043',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  lottie: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  successText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BarcodeFoodLogScreen;