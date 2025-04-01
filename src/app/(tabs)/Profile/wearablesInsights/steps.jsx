import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  TextInput,
  Modal,
  Vibration,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, FontAwesome5, Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import useHealthData from '../../../../hooks/usehealthdata';
import { useuserDetailContext } from '../../../context/UserDetailContext';

const { width, height } = Dimensions.get('window');

const StepsMonitorScreen = () => {
  const insets = useSafeAreaInsets();
  const {healthData, weeklyHealthData, fetchHealthData} = useHealthData();
  
  const [steps, setSteps] = useState(0);
  const [goal, setGoal] = useState(10000);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState('10000');
  const [selectedDay, setSelectedDay] = useState(3); // Thursday (0-indexed)
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const {userDetail} = useuserDetailContext();
  fetchHealthData();
  console.log("StepsMonitorScreen userDetail", weeklyHealthData); 
  const router = useRouter();

  // Animation values
  const progressAnimation = useState(new Animated.Value(0))[0];
  const achievementAnim = useState(new Animated.Value(0))[0];
  
  // Weekly data
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];  
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]);

  // Calculate streak of days meeting the goal
  const calculateStreak = () => {
    if (!weeklyHealthData?.weeklySteps) return 0;
    
    let streak = 0;
    const reversedData = [...weeklyHealthData.weeklySteps].reverse();
    
    for (let i = 0; i < reversedData.length; i++) {
      if (reversedData[i] >= goal) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Check if any day has 25,000+ steps (Marathon achievement)
  const hasMarathonDay = () => {
    if (!weeklyHealthData?.weeklySteps) return false;
    return weeklyHealthData.weeklySteps.some(daySteps => daySteps >= 25000);
  };

  // Check if all days have activity (at least 1000 steps)
  const hasConsistentActivity = () => {
    if (!weeklyHealthData?.weeklySteps) return false;
    return weeklyHealthData.weeklySteps.every(daySteps => daySteps >= 1000);
  };

  // Check for early bird (approximation - we don't have time data)
  // Let's assume if the current steps are above 5000 and it's still morning
  const isEarlyBird = () => {
    const currentHour = new Date().getHours();
    return healthData.steps >= 5000 && currentHour < 12;
  };

  // Dynamically updated achievements
  const [achievements, setAchievements] = useState([
    { title: 'Early Bird', description: '5,000 steps before noon', icon: 'sunrise', completed: false },
    { title: 'Step Master', description: 'Reach your goal 5 days in a row', icon: 'award', completed: false },
    { title: 'Marathon', description: '25,000 steps in one day', icon: 'trending-up', completed: false },
    { title: 'Consistent', description: 'Activity every day for a week', icon: 'calendar', completed: false },
  ]);

  useEffect(() => {
    if (weeklyHealthData?.weeklySteps) {
        setWeeklyData(weeklyHealthData.weeklySteps);
    }
  }, [weeklyHealthData]);

  useEffect(() => {
    setSteps(healthData.steps);
  }, [healthData.steps]);

  // Update achievements based on real data
  useEffect(() => {
    if (healthData.steps && weeklyHealthData?.weeklySteps) {
      const streak = calculateStreak();
      const updatedAchievements = [
        { ...achievements[0], completed: isEarlyBird() },
        { ...achievements[1], completed: streak >= 5 },
        { ...achievements[2], completed: hasMarathonDay() },
        { ...achievements[3], completed: hasConsistentActivity() }
      ];
      
      setAchievements(updatedAchievements);
    }
  }, [healthData.steps, weeklyHealthData]);

  useEffect(() => {
    animateProgress();
  }, [steps, goal]);

  useEffect(() => {
    if (showAchievement) {
      Vibration.vibrate(200);
      Animated.sequence([
        Animated.timing(achievementAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(achievementAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => setShowAchievement(false));
    }
  }, [showAchievement]);

  const animateProgress = () => {
    Animated.timing(progressAnimation, {
      toValue: steps / goal,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const progressInterpolate = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const addSteps = () => {
    // Get current completed achievements to compare later
    const previouslyCompleted = achievements.filter(a => a.completed);
    
    // Update steps
    const newSteps = healthData.steps + 1000;
    // This would normally come from the health data, but for testing we're incrementing
    setSteps(newSteps);
    
    // Check if any new achievements were unlocked
    setTimeout(() => {
      const newlyCompleted = achievements.filter(a => a.completed && !previouslyCompleted.includes(a));
      
      if (newlyCompleted.length > 0) {
        // Show the first newly completed achievement
        setCurrentAchievement(newlyCompleted[0]);
        setShowAchievement(true);
      } else if (Math.random() > 0.7) {
        // Randomly show an already completed achievement
        const completedAchievements = achievements.filter(a => a.completed);
        if (completedAchievements.length > 0) {
          setCurrentAchievement(completedAchievements[Math.floor(Math.random() * completedAchievements.length)]);
          setShowAchievement(true);
        }
      }
    }, 100);
  };

  const setNewStepGoal = () => {
    const numGoal = parseInt(newGoal);
    if (!isNaN(numGoal) && numGoal > 0) {
      setGoal(numGoal);
    }
    setModalVisible(false);
  };

  const calculateCalories = (stepCount) => {
    // Simplified calculation: approximately 0.04 calories per step
    return Math.round(stepCount * 0.04);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };
  
  const calculateProgress = () => {
    return Math.min(Math.round((steps / goal) * 100), 100);
  };

  const renderAchievementPopup = () => {
    if (!currentAchievement) return null;
    
    return (
      <Animated.View 
        style={[
          styles.achievementPopup,
          {
            transform: [
              { translateY: achievementAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0]
              })},
              { scale: achievementAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.8, 1.1, 1]
              })}
            ],
            opacity: achievementAnim
          }
        ]}
      >
        <View style={styles.achievementContainer}>
          <View style={styles.achievementIconContainer}>
            <Feather name={currentAchievement.icon} size={24} color="#fff" />
          </View>
          <View style={styles.achievementTextContainer}>
            <Text style={styles.achievementTitle}>{currentAchievement.title}</Text>
            <Text style={styles.achievementDesc}>{currentAchievement.description}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>{router.back()}} style={{ padding: 10 }}>
            <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerSmall}>Activity</Text>
          <Text style={styles.headerTitle}>Statistics</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Image 
            source={{ uri: userDetail.profileUrl }} 
            style={styles.profileImage} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Step Counter */}
        <View style={styles.stepCardContainer}>
          <View style={styles.goalInfoContainer}>
            <Text style={styles.dateText}>Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              style={styles.goalButton}
            >
              <Text style={styles.goalButtonText}>Goal: {formatNumber(goal)}</Text>
              <Feather name="edit-2" size={12} color="#666" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.circularProgressContainer}>
            <View style={styles.circularProgressOuter}>
              <Animated.View 
                style={[
                  styles.circularProgressInner,
                  { 
                    width: `${calculateProgress()}%`,
                    backgroundColor: calculateProgress() >= 100 ? '#22c55e' : '#3b82f6',
                  }
                ]}
              />
              <View style={styles.circularProgressContent}>
                <Text style={styles.stepsText}>{formatNumber(steps)}</Text>
                <Text style={styles.stepsLabel}>steps</Text>
                <Text style={styles.progressPercentText}>{calculateProgress()}% of goal</Text>
              </View>
            </View>
          </View>          
          {/* Stats Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <FontAwesome5 name="fire" size={18} color="#ef4444" />
              </View>
              <Text style={styles.statValue}>{calculateCalories(steps)}</Text>
              <Text style={styles.statLabel}>calories</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Feather name="map" size={18} color="#3b82f6" />
              </View>
              <Text style={styles.statValue}>{(steps * 0.0008).toFixed(2)}</Text>
              <Text style={styles.statLabel}>km</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <Feather name="clock" size={18} color="#8b5cf6" />
              </View>
              <Text style={styles.statValue}>{Math.floor(steps / 1000)}</Text>
              <Text style={styles.statLabel}>minutes</Text>
            </View>
          </View>
        </View>

        {/* Weekly Activity */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>View more</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartContainer}>
            {weeklyData.map((daySteps, index) => {
              const height = Math.min((daySteps / goal) * 100, 100);
              const isSelected = index === selectedDay;
              const percentage = Math.round((daySteps / goal) * 100);
              const barColor = daySteps >= goal ? '#22c55e' : '#3b82f6';
              
              return (
                <TouchableOpacity 
                  key={index}
                  onPress={() => {
                    setSelectedDay(index);
                    setSteps(weeklyData[index]);
                  }}
                  style={styles.chartBarColumn}
                >
                  {isSelected && (
                    <View style={styles.selectedStepsBubble}>
                      <Text style={styles.selectedStepsText}>{formatNumber(daySteps)}</Text>
                    </View>
                  )}
                  <View style={styles.chartBarWrapper}>
                    <View 
                      style={[
                        styles.chartBar, 
                        { height: `${height}%`, backgroundColor: barColor },
                        isSelected && styles.chartBarSelected
                      ]}
                    />
                  </View>
                  <Text style={[
                    styles.chartDayLabel,
                    isSelected && styles.chartDayLabelSelected
                  ]}>
                    {weekDays[index]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>View all</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.achievementsContainer}>
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementItem}>
                <View style={[
                  styles.achievementIconCircle,
                  { backgroundColor: achievement.completed ? 'rgba(59, 130, 246, 0.1)' : 'rgba(229, 231, 235, 0.5)' }
                ]}>
                  <Feather 
                    name={achievement.icon} 
                    size={18} 
                    color={achievement.completed ? '#3b82f6' : '#9ca3af'} 
                  />
                </View>
                <View style={styles.achievementDetails}>
                  <Text style={[
                    styles.achievementItemTitle,
                    { color: achievement.completed ? '#111827' : '#6b7280' }
                  ]}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementItemDesc}>{achievement.description}</Text>
                </View>
                {achievement.completed ? (
                  <View style={styles.completedBadge}>
                    <Feather name="check" size={12} color="#fff" />
                  </View>
                ) : (
                  <View style={styles.lockedBadge}>
                    <Feather name="lock" size={12} color="#9ca3af" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Add Steps Button */}
        <TouchableOpacity 
          style={styles.addStepsButton}
          onPress={addSteps}
        >
          <LinearGradient
            colors={['#3b82f6', '#1d4ed8']}
            style={styles.addStepsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="plus" size={20} color="#fff" />
            <Text style={styles.addStepsText}>Add Steps</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Set Goal Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Daily Step Goal</Text>
            
            <TextInput
              style={styles.goalInput}
              value={newGoal}
              onChangeText={setNewGoal}
              keyboardType="number-pad"
              maxLength={6}
            />
            
            <Slider
              style={styles.slider}
              minimumValue={2000}
              maximumValue={20000}
              step={500}
              value={parseInt(newGoal) || 10000}
              onValueChange={(value) => setNewGoal(value.toString())}
              minimumTrackTintColor="#3b82f6"
              maximumTrackTintColor="#e5e7eb"
              thumbTintColor="#1d4ed8"
            />
            
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>2,000</Text>
              <Text style={styles.sliderLabel}>20,000</Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={setNewStepGoal}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Achievement Popup */}
      {showAchievement && renderAchievementPopup()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerSmall: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  stepCardContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  goalInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goalButtonText: {
    fontSize: 12,
    color: '#4b5563',
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  circularProgressOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  circularProgressInner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '100%',
    borderTopRightRadius: 100,
    borderTopLeftRadius: 100,
  },
  circularProgressContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  stepsText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
  },
  stepsLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  progressPercentText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  seeAllButton: {
    fontSize: 14,
    color: '#3b82f6',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chartBarColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    position: 'relative',
  },
  selectedStepsBubble: {
    position: 'absolute',
    top: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    zIndex: 10,
  },
  selectedStepsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  chartBarWrapper: {
    width: '100%',
    height: '80%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  chartBarSelected: {
    width: 12,
  },
  chartDayLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  chartDayLabelSelected: {
    color: '#111827',
    fontWeight: '600',
  },
  achievementsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  achievementIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementDetails: {
    flex: 1,
  },
  achievementItemTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  achievementItemDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
  completedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addStepsButton: {
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addStepsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  addStepsText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    color: '#111827',
  },
  goalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    color: '#3b82f6',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sliderLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  achievementPopup: {
    position: 'absolute',
    top: 90,
    left: 24,
    right: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementTextContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#6b7280',
  }
});

export default StepsMonitorScreen;