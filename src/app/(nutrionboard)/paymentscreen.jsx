import { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Animated, 
  ScrollView,
  ImageBackground
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import {toast} from "sonner-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {useNutriRegistrationContext} from '../context/NutriRegistration';
import {useNutritionistDetailContext} from '../context/NutritionistContext';
import axios from "axios";
import { useRouter,useNavigation  } from "expo-router";
import RazorpayCheckout from "react-native-razorpay";
import { URL } from "../../constants/url";


const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;

const plans = [
  { 
    id: "plan_PxdYREbwLWG4pT", 
    name: "Basic", 
    price: 9999, 
    description: "10 clients per month", 
    features: ["Advanced meal planning", "limited clients"],
    color: ["#6a11cb", "#2575fc"],
    icon: "food-apple"
  },
  { 
    id: "plan_Q502Oe0iS8YKCq", 
    name: "Premium", 
    price: 14999, 
    description: "50 clients per month", 
    features: ["Everything in Standard", "Priority support", "Unlimited chat support", "Unlimited meal planning", "Progress tracking"],
    color: ["#ff9a9e", "#fad0c4"],
    icon: "crown"
  },
];

export default function NutritionistSubscription() {
  const [selectedPlan, setSelectedPlan] = useState(plans[1]); // Default to middle plan
  const [scrollIndex, setScrollIndex] = useState(1);
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const {nutriregistrationData, updateNutriRegistrationData} = useNutriRegistrationContext();
  const {nutritionistDetail, updateNutritionistDetail} = useNutritionistDetailContext({});
  const router = useRouter();
  const navigation = useNavigation();



  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / CARD_WIDTH);
    if (index !== scrollIndex) {
      setScrollIndex(index);
      setSelectedPlan(plans[index]);
    }
  };

  const handleSubscribe = async () => {
    try {
      // Call backend to create subscription
      const response = await axios.post(`${URL}/create-subscription`, {
        planId: selectedPlan.id,
        userId: nutritionistDetail.userId,
      });
  
      const subscription = response.data.subscription;
  
      // Open Razorpay checkout
      const options = {
        key: "rzp_test_2feKTmwDwvl0Yb",
        subscription_id: subscription.id,
        name: "WellMate",
        description: selectedPlan.name,
        theme: { color: "#FF416C" },
      };
  
      const data = await RazorpayCheckout.open(options);
  
      if (data.razorpay_payment_id) {
        toast.success(`Subscription Successful!`, {
          duration: 3000,
          description: `Payment ID: ${data.razorpay_payment_id}`,
          dismiss: true,
          position: "top",
        });
  
        // Save subscription details to backend
        await axios.post(`${URL}/create-subscription/save-subscription`, {
          userId: nutritionistDetail.userId,
          subscriptionId: subscription.id,
          paymentId: data.razorpay_payment_id,
        });
  
        const data1 = {
          UserId: nutritionistDetail.userId,
          experience: nutriregistrationData.experience,
          gender: "Male",
          age: "20",
          brandname: nutriregistrationData.brandname,
          brandlogo: nutriregistrationData.brandlogo || '',
          specialization: nutriregistrationData.specialization,
          certifications: nutriregistrationData.certifications
        };
        console.log('Complete profile data being sent:', data1);
        
        // Store the response from complete-profile
        const response1 = await axios.post(`${URL}/registration/complete-profile`, data1);
        
        // Log the full response
        console.log("Complete profile response:", response1.data.NutritionistId);
        
        if (response1.data && response1.data.NutritionistId) {
          await updateNutritionistDetail('nutritionistId', response1.data.NutritionistId);
          console.log("Saved NutritionistId:", response1.data.NutritionistId);
          
          console.log("NutritionistId stored:", response1.data.NutritionistId);
        } else if (response1.data && response1.data.savedNutritionist && response1.data.savedNutritionist._id) {
          // Fallback in case the structure changes
          updateNutritionistDetail('nutritionistId', response1.data.savedNutritionist._id);
          console.log("NutritionistId stored from savedNutritionist:", response1.data.savedNutritionist._id);
        } else {
          console.error("Could not find NutritionistId in response:", response1.data);
        }
        
        // Add a small delay to ensure state updates before navigation
        setTimeout(() => {
          navigation.navigate("(nutritionist)");
        }, 300);
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      toast.error("Subscription Failed. Please try again.");
    }
  };

  
  const scrollToIndex = (index) => {
    scrollViewRef.current.scrollTo({
      x: index * CARD_WIDTH,
      animated: true,
    });
  };

  useEffect(() => {
    // Scroll to the middle plan on initial load
    setTimeout(() => {
      scrollToIndex(1);
    }, 500);
  }, []);

  return (
    <ImageBackground
      source={{ uri: `https://api.a0.dev/assets/image?text=healthy%20food%20soft%20nutritious%20background&aspect=9:16&seed=123` }}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <View style={styles.overlay} />
      
      <Animated.View 
        style={[
          styles.headerContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: translateY }]
          }
        ]}
      >
        <Text style={styles.title}>Nutrition Plans</Text>
        <Text style={styles.subtitle}>Expert guidance for your wellness journey</Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.cardsContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={styles.scrollContent}
          onMomentumScrollEnd={handleScroll}
        >
          {plans.map((plan, index) => (
            <TouchableOpacity
              key={plan.id}
              activeOpacity={0.9}
              style={[
                styles.planCard,
                selectedPlan.id === plan.id && styles.selectedPlan
              ]}
              onPress={() => {
                setSelectedPlan(plan);
                scrollToIndex(index);
              }}
            >
              <LinearGradient
                colors={plan.color}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name={plan.icon} size={32} color="#fff" />
                </View>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>₹{(plan.price / 100).toFixed(2)}<Text style={styles.perMonth}>/month</Text></Text>
                <Text style={styles.planDescription}>{plan.description}</Text>
                
                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={styles.paginationContainer}>
          {plans.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                scrollIndex === index && styles.paginationDotActive
              ]}
              onPress={() => scrollToIndex(index)}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View 
        style={[
          styles.bottomContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(translateY, -1) }]
          }
        ]}
      >
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <FontAwesome5 name="heartbeat" size={18} color="#ff5e62" />
            <Text style={styles.benefitText}>Personalized Guidance</Text>
          </View>
          <View style={styles.benefitItem}>
            <FontAwesome5 name="clock" size={18} color="#ff5e62" />
            <Text style={styles.benefitText}>24/7 Support</Text>
          </View>
          <View style={styles.benefitItem}>
            <FontAwesome5 name="medal" size={18} color="#ff5e62" />
            <Text style={styles.benefitText}>Certified Experts</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.subscribeButton}
          activeOpacity={0.8}
          onPress={handleSubscribe}
        >
          <LinearGradient
            colors={["#FF416C", "#FF4B2B"]}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
    color: "#666",
    fontWeight: "500",
  },
  cardsContainer: {
    height: 420,
    marginTop: 10,
  },
  scrollContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 2,
  },
  planCard: {
    width: CARD_WIDTH,
    height: 380,
    borderRadius: 20,
    marginHorizontal: 6,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  selectedPlan: {
    transform: [{ scale: 1.02 }],
  },
  cardGradient: {
    flex: 1,
    paddingVertical: 25,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  planName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  perMonth: {
    fontSize: 14,
    fontWeight: "normal",
  },
  planDescription: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
    textAlign: "center",
  },
  featuresContainer: {
    alignItems: "flex-start",
    width: "100%",
    marginTop: 6,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 8,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
    marginHorizontal: 5,
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: "#FF416C",
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 24,
  },
  benefitsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  benefitItem: {
    alignItems: "center",
  },
  benefitText: {
    marginTop: 6,
    fontSize: 12,
    color: "#555",
  },
  subscribeButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#FF416C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  subscribeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  termsContainer: {
    alignItems: "center",
  },
  termsText: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
  },
});