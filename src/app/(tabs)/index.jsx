import React, { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  Animated,
  FlatList,
  Alert,
  StatusBar,
  Platform
} from 'react-native';
import { ProgressBar, MD3Colors } from 'react-native-paper';
import RingProgress from '@/src/components/RingProgress';
import { AntDesign, MaterialCommunityIcons, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useuserDetailContext } from '../context/UserDetailContext';
import { LinearGradient } from 'expo-linear-gradient';
import { URL } from '@/src/constants/url';
import { router, useNavigation, useRouter } from 'expo-router';
import useHealthData from '../../hooks/usehealthdata';

const { width } = Dimensions.get('window');
const cardWidth = width - 40;

const MacroBar = ({ title, consumed, goal, color }) => {
  const percentage = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  return (
    <View style={styles.macroBarContainer}>
      <View style={styles.macroLabelContainer}>
        <Text style={styles.macroLabel}>{title}</Text>
        <Text style={styles.macroValue}>
          {consumed.toFixed(1)} <Text style={styles.macroGoal}>/ {goal}</Text>
        </Text>
      </View>
      <View style={styles.progressBarBg}>
        <Animated.View 
          style={[
            styles.progressBarFg, 
            { 
              width: `${percentage * 100}%`,
              backgroundColor: color 
            }
          ]} 
        />
      </View>
    </View>
  );
};

const LoggedFoodItem = ({ food }) => {
  return (
    <View style={styles.loggedFoodItem}>
      <View style={styles.foodImageContainer}>
        <Image 
          source={{ uri: food.image }} 
          style={styles.foodImage} 
          resizeMode="cover"
        />
      </View>
      <View style={styles.foodDetails}>
        <Text style={styles.foodName}>{food.name}</Text>
        <Text style={styles.foodMacros}>
          {food.calories} cal • {food.amount}
        </Text>
      </View>
      <View style={styles.macroCircles}>
        <View style={styles.macroCircle}>
          <Text style={styles.macroCircleValue}>{food.protein}g</Text>
          <Text style={styles.macroCircleLabel}>P</Text>
        </View>
        <View style={styles.macroCircle}>
          <Text style={styles.macroCircleValue}>{food.carbs}g</Text>
          <Text style={styles.macroCircleLabel}>C</Text>
        </View>
        <View style={styles.macroCircle}>
          <Text style={styles.macroCircleValue}>{food.fat}g</Text>
          <Text style={styles.macroCircleLabel}>F</Text>
        </View>
      </View>
    </View>
  );
};

const extractNumber = (value) => {
  return parseFloat(value.replace(/[^0-9.]/g, "")); // Removes non-numeric characters
};

const SummarySlider = () => {
  const { userDetail } = useuserDetailContext();
  const [calConsumed, setCalConsumed] = useState(0);
  const [proConsumed, setProConsumed] = useState(0);
  const [carbsConsumed, setCarbsConsumed] = useState(0);
  const [fatsConsumed, setFatsConsumed] = useState(0);
  const [calGoal, setCalGoal] = useState(1); // Avoid division by zero
  const [proteinGoal, setProteinGoal] = useState(1);
  const [carbsGoal, setCarbsGoal] = useState(1);
  const [fatsGoal, setFatsGoal] = useState(1);
  const router = useRouter();
  
  
  const getInfo = async () => {
    try {
      const calConsumedRes = await axios.get(`${URL}/foodlog/${userDetail.regularId}`);
      const calGoalRes = await axios.get(`${URL}/regular/regular-users/${userDetail.userId}`);
      
      setCalConsumed(extractNumber(calConsumedRes.data.totalCalConsumed || 0));
      setProConsumed(extractNumber(calConsumedRes.data.totalproteinConsumed || 0));
      setCarbsConsumed(extractNumber(calConsumedRes.data.totalcarbs || 0));
      setFatsConsumed(extractNumber(calConsumedRes.data.totalfat || 0));
      
      setCalGoal(calGoalRes.data.regularUser.goalCalories || 1);
      setProteinGoal(calGoalRes.data.regularUser.macros.protein || 1);
      setCarbsGoal(calGoalRes.data.regularUser.macros.carbs || 1);
      setFatsGoal(calGoalRes.data.regularUser.macros.fats || 1);
    } catch (error) {
      console.log("Error fetching summary data:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getInfo();
    }, [])
  );

  const data = [
    { 
      id: 1, 
      calConsumed, 
      calGoal, 
      img: require("../../../assets/images/eat.png"), 
      ringcolor: '#4A90E2', 
      title: "Daily Calories", 
      goaltype: "Calories", 
      goalUnit: 'kcal'
    },
    { 
      id: 2, 
      calConsumed: proConsumed, 
      calGoal: proteinGoal, 
      img: require("../../../assets/images/balanced-diet.png"), 
      ringcolor: '#FF6B6B', 
      title: "Protein Intake", 
      goaltype: "Protein", 
      goalUnit: 'g' 
    },
    { 
      id: 3, 
      calConsumed: carbsConsumed, 
      calGoal: carbsGoal, 
      img: require("../../../assets/images/eat.png"), 
      ringcolor: '#FFD166', 
      title: "Carbs Intake", 
      goaltype: "Carbs", 
      goalUnit: 'g' 
    },
    { 
      id: 4, 
      calConsumed: fatsConsumed, 
      calGoal: fatsGoal, 
      img: require("../../../assets/images/eat.png"), 
      ringcolor: '#06D6A0', 
      title: "Fats Intake", 
      goaltype: "Fats", 
      goalUnit: 'g' 
    }
  ];

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={width * 0.8}
      decelerationRate="fast"
      contentContainerStyle={styles.summarySliderContent}
      renderItem={({ item }) => (
        <LinearGradient
          colors={['#ffffff', '#f7f9fc']}
          style={styles.summaryCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={styles.ringContainer}>
            <RingProgress
              radius={60}
              strokeWidth={7}
              color={item.ringcolor}
              progress={item.calGoal ? item.calConsumed / item.calGoal : 0}
              value={''}
              icon={item.img}
              iconHeight={70}
              labelSize={15}
              icontop={3.5}
              labeltop={28}
            />
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{item.goaltype} Consumed:</Text>
            <Text style={styles.summaryValue}>
              {item.calConsumed.toFixed(0)} / {item.calGoal} {item.goalUnit}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Remaining {item.goaltype}:</Text>
            <Text style={[
              styles.summaryValue, 
              { color: item.calGoal && item.calConsumed <= item.calGoal ? '#4CAF50' : '#F44336' }
            ]}>
              {item.calGoal ? Math.max(0, (item.calGoal - item.calConsumed)).toFixed(0) : 0} {item.goalUnit}
            </Text>
          </View>
        </LinearGradient>
      )}
    />
  );
};

const Dashboard = () => {
  const [waterIntake, setWaterIntake] = useState(0);
  const { userDetail } = useuserDetailContext();
  const [calConsumed, setCalConsumed] = useState(0);
  const [proConsumed, setProConsumed] = useState(0);
  const [carbsConsumed, setCarbsConsumed] = useState(0);
  const [fatsConsumed, setFatsConsumed] = useState(0);
  const [calGoal, setCalGoal] = useState(1); // Avoid division by zero
  const [proteinGoal, setProteinGoal] = useState(1);
  const [carbsGoal, setCarbsGoal] = useState(1);
  const [fatsGoal, setFatsGoal] = useState(1);
  const scrollY = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const {healthData, fetchHealthData} = useHealthData();
  const [hasNotifications, setHasNotifications] = useState(true); // Set to true to show the notification badge
  fetchHealthData();

  const getInfo = async () => {
    try {
      const calConsumedRes = await axios.get(`${URL}/foodlog/${userDetail.regularId}`);
      const calGoalRes = await axios.get(`${URL}/regular/regular-users/${userDetail.userId}`);
      // console.log(calConsumedRes.data.foodLogs[5].image);

      setCalConsumed(extractNumber(calConsumedRes.data.totalCalConsumed || 0));
      setProConsumed(extractNumber(calConsumedRes.data.totalproteinConsumed || 0));
      setCarbsConsumed(extractNumber(calConsumedRes.data.totalcarbs || 0));
      setFatsConsumed(extractNumber(calConsumedRes.data.totalfat || 0));
      
      setCalGoal(calGoalRes.data.regularUser.goalCalories || 1);
      setProteinGoal(calGoalRes.data.regularUser.macros.protein || 1);
      setCarbsGoal(calGoalRes.data.regularUser.macros.carbs || 1);
      setFatsGoal(calGoalRes.data.regularUser.macros.fats || 1);


      // Fixed implementation
      setLoggedFoods(calConsumedRes.data.foodLogs.map((foodlog, index) => {
        return {
          id: index.toString(), 
          name: foodlog.foodName,
          amount: foodlog.serving,
          calories: foodlog.calories,
          protein: foodlog.protein,
          carbs: foodlog.carbs,
          fat: foodlog.fats, // Note: your component uses 'fat' but the API returns 'fats'
          mealType: foodlog.mealType,
          time: '0:00',
          image: foodlog?.image? foodlog.image : 'https://api.a0.dev/assets/image?text=oatmeal%20with%20blueberries%20in%20wooden%20bowl&aspect=1:1',
        };
      }));
    } catch (error) {
      console.log("Error fetching summary data:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getInfo();
    }, [])
  );

  // Mock data for logged foods - Replace with actual API data
  const [loggedFoods, setLoggedFoods] = useState([]);

  const navigateToNotifications = () => {
    // navigation.navigate('Notifications');
    router.push('/(tabs)/Profile/wearablesInsights/notification');
  };

  const addWater = () => {
    if (waterIntake < 100) {
      setWaterIntake(waterIntake + 12.5); // Increase by 1/8th (one glass)
    } else {
      Alert.alert('Great job!', 'You have met your water intake goal for the day!');
    }
  };

  const healthStats = [
    { 
      title: 'Steps', 
      value: healthData.steps, 
      target: 10000,
      progress: (healthData.steps / 10000), 
      icon: 'directions-walk',
      iconType: 'MaterialIcons',
      color: '#4A90E2'
    },
    { 
      title: 'Calories Burned', 
      value: Math.round(healthData.steps * 0.0447), 
      target: 600,
      progress: (healthData.steps * 0.045 / 600), 
      icon: 'fire',
      iconType: 'FontAwesome5',
      color: '#FF6B6B'
    },
    { 
      title: 'Heart Rate', 
      value: healthData.heartRate, 
      // target: '8h',
      // progress: (healthData.sleepHours/8), 
      icon: 'heart',
      iconType: 'FontAwesome5',
      color: '#8A2BE2'
    },
  ];

  const renderIcon = (icon, type, color) => {
    switch (type) {
      case 'MaterialIcons':
        return <MaterialIcons name={icon} size={22} color={color} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={icon} size={20} color={color} />;
      default:
        return <MaterialIcons name={icon} size={22} color={color} />;
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with notification icon */}
      <LinearGradient
        colors={['#4A90E2', '#5A9DE2']}
        style={styles.headerGradient}
      >
      </LinearGradient>
      
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Personalized Greeting */}
        <LinearGradient
          colors={['#4A90E2', '#5A9DE2']}
          style={styles.greetingBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.greetingContainer}>
            <View>
              <Text style={styles.greeting}>Hello, {userDetail.name}!</Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              <Text style={styles.motivation}>"Every bite counts towards your goal!"</Text>
            </View>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: userDetail.profileUrl }}
                style={styles.profileImage}
                resizeMode='cover'
              />
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={navigateToNotifications}
            >
              <Ionicons name="notifications" size={24} color="#fff" />
              {hasNotifications && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        {/* Calorie & Macro Summary Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nutrition Summary</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See Details</Text>
            </TouchableOpacity>
          </View>
          
          <SummarySlider />
          
          <View style={styles.macroBreakdownContainer}>
            <Text style={styles.macroBreakdownTitle}>Macro Breakdown</Text>
            <MacroBar title="Protein" consumed={proConsumed} goal={proteinGoal} color="#FF6B6B" />
            <MacroBar title="Carbs" consumed={carbsConsumed} goal={carbsGoal} color="#FFD166" />
            <MacroBar title="Fats" consumed={fatsConsumed} goal={fatsGoal} color="#06D6A0" />
          </View>
        </View>

        {/* Logged Foods Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Food Log</Text>
            <TouchableOpacity style={styles.addFoodButton}
              onPress={()=>{navigation.navigate('FoodLog');
              }}
            >
              <AntDesign name="plus" size={18} color="#fff" />
              <Text style={styles.addFoodText}>Add Food</Text>
            </TouchableOpacity>
          </View>

          {loggedFoods.map(food => (
            <LoggedFoodItem key={food.id} food={food} />
          ))}

          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Logged Foods</Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Health Stats Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Stats</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Details</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.healthStatsContainer}>
            {healthStats.map((stat, index) => (
              <View key={index} style={styles.healthStat}>
                <View style={[styles.healthStatIconContainer, { backgroundColor: `${stat.color}20` }]}>
                  {renderIcon(stat.icon, stat.iconType, stat.color)}
                </View>
                <View style={styles.healthStatInfo}>
                  <Text style={styles.healthStatTitle}>{stat.title}</Text>
                  <Text style={styles.healthStatValue}>{stat.value}</Text>
                  <View style={styles.healthStatProgressContainer}>
                    <View style={styles.healthStatProgressBg}>
                      <View 
                        style={[
                          styles.healthStatProgressFg, 
                          { width: `${stat.progress * 100}%`, backgroundColor: stat.color }
                        ]} 
                      />
                    </View>
                    <Text style={styles.healthStatTarget}>{stat.target}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Water Intake Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Water Intake</Text>
          </View>
          
          <View style={styles.waterTracker}>
            <View style={styles.waterVisual}>
              <View style={styles.waterGlassContainer}>
                <MaterialCommunityIcons name="cup-water" size={40} color="#4A90E2" />
                <Text style={styles.waterAmount}>{Math.floor(waterIntake / 12.5)}/8</Text>
                <Text style={styles.waterLabel}>glasses</Text>
              </View>
              <View style={styles.waterProgressContainer}>
                <View style={styles.waterWave}>
                  <View style={[styles.waterFill, { height: `${waterIntake}%` }]}>
                    <LinearGradient
                      colors={['#4facfe', '#00f2fe']}
                      style={styles.waterGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                </View>
                <Text style={styles.waterPercentage}>{waterIntake}%</Text>
              </View>
            </View>
            
            <View style={styles.waterControls}>
              <TouchableOpacity 
                style={styles.waterButton}
                onPress={addWater}
              >
                <FontAwesome5 name="plus" size={16} color="#fff" />
                <Text style={styles.waterButtonText}>Add Glass</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 0,
    paddingHorizontal: 20,
  },
  notificationContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 5,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  greetingBanner: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 15,
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  motivation: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  profileImageContainer: {
    height: 60,
    width: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    height: '100%',
    width: '100%',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    padding: 5,
  },
  seeAllText: {
    color: '#4A90E2',
    fontWeight: '500',
  },
  summarySliderContent: {
    paddingLeft: 5,
    paddingRight: 15,
  },
  summaryCard: {
    width: width * 0.75,
    padding: 15,
    borderRadius: 16,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  macroBreakdownContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  macroBreakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  macroBarContainer: {
    marginBottom: 15,
  },
  macroLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  macroLabel: {
    fontSize: 14,
    color: '#555',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  macroGoal: {
    fontWeight: 'normal',
    color: '#888',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFg: {
    height: '100%',
    borderRadius: 4,
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addFoodText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 5,
  },
  loggedFoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  foodImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 15,
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  foodDetails: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  foodMacros: {
    fontSize: 14,
    color: '#777',
  },
  macroCircles: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  macroCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 3,
  },
  macroCircleValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  macroCircleLabel: {
    fontSize: 8,
    color: '#888',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingVertical: 10,
  },
  viewAllText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
  healthStatsContainer: {
    marginTop: 5,
  },
  healthStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  healthStatIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  healthStatInfo: {
    flex: 1,
  },
  healthStatTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  healthStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  healthStatProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthStatProgressBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  healthStatProgressFg: {
    height: '100%',
    borderRadius: 3,
  },
  healthStatTarget: {
    fontSize: 12,
    color: '#888',
    width: 40,
    textAlign: 'right',
  },
  waterTracker: {
    alignItems: 'center',
  },
  waterVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  waterGlassContainer: {
    alignItems: 'center',
  },
  waterAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  waterLabel: {
    fontSize: 14,
    color: '#777',
  },
  waterProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterWave: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  waterFill: {
    width: '100%',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
  },
  waterGradient: {
    width: '100%',
    height: '100%',
  },
  waterPercentage: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  waterControls: {
    flexDirection: 'row',
    marginTop: 10,
  },
  waterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  waterButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default Dashboard;