import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { useClientUserContext } from '../../context/ClientUserContext';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { URL } from '../../../constants/url';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const ClientProfileScreen = () => {
  const { clientUser, logout } = useClientUserContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [activeSection, setActiveSection] = useState('health');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerHeight = useRef(new Animated.Value(Platform.OS === 'ios' ? 280 : 260)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Start entrance animations when data is loaded
  useEffect(() => {
    if (!loading && profileData) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, profileData]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${URL}/api/clientdata/${clientUser.clientId}`);
      console.log('Profile data:', response.data.client);
      setProfileData(response.data.client);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const handleEditProfile = () => {
    router.push('/(client)/Profile/edit');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await AsyncStorage.removeItem('isLoggedIn');
              console.log("Logging out...");
              
              // Clear other stored data if needed
              await AsyncStorage.multiRemove([
                'clientToken',
                'clientUser'
              ]);
              
              router.replace('/(auth)');
            } catch (error) {
              console.error("Error logging out:", error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    
    // Calculate tab indicator position
    let position = 0;
    switch(section) {
      case 'health':
        position = 0;
        break;
      case 'stats':
        position = width / 3;
        break;
      case 'nutrition':
        position = (width / 3) * 2;
        break;
    }
    
    // Animate tab indicator
    Animated.spring(tabIndicatorPosition, {
      toValue: position,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  // Header animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [0, -180],
    extrapolate: 'clamp',
  });

  const headerImageOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [120, 180],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const renderProfileHeader = () => (
    <Animated.View 
      style={[
        styles.profileHeader,
        {
          transform: [{ translateY: headerTranslate }],
        }
      ]}
    >
      <LinearGradient
        colors={['#3E6B89', '#5E8CAD']}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.headerImageContainer, { opacity: headerImageOpacity }]}>
          <Image
            source={{ 
              uri: profileData?.profileUrl || 'https://via.placeholder.com/150'
            }}
            style={styles.avatar}
          />
        </Animated.View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{profileData?.name || 'User Name'}</Text>
          <Text style={styles.email}>{profileData?.email || 'user@example.com'}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData?.age || '-'}</Text>
              <Text style={styles.statLabel}>Age</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData?.height || '-'}</Text>
              <Text style={styles.statLabel}>Height (cm)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData?.weight || '-'}</Text>
              <Text style={styles.statLabel}>Weight (kg)</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
      
      <TouchableOpacity 
        style={styles.editButton}
        onPress={handleEditProfile}
      >
        <Feather name="edit-2" size={16} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCompactHeader = () => (
    <Animated.View 
      style={[
        styles.compactHeader, 
        { opacity: headerOpacity }
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={90} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF' }]} />
      )}
      
      <Animated.Text style={[styles.compactHeaderTitle, { opacity: headerTitleOpacity }]}>
        {profileData?.name || 'Profile'}
      </Animated.Text>
    </Animated.View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, activeSection === 'health' && styles.activeTabItem]} 
          onPress={() => handleSectionChange('health')}
        >
          <Feather 
            name="activity" 
            size={18} 
            color={activeSection === 'health' ? '#3E6B89' : '#8896AB'} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeSection === 'health' && styles.activeTabText
            ]}
          >
            Health
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeSection === 'stats' && styles.activeTabItem]} 
          onPress={() => handleSectionChange('stats')}
        >
          <Feather 
            name="user" 
            size={18} 
            color={activeSection === 'stats' ? '#3E6B89' : '#8896AB'} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeSection === 'stats' && styles.activeTabText
            ]}
          >
            Stats
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeSection === 'nutrition' && styles.activeTabItem]} 
          onPress={() => handleSectionChange('nutrition')}
        >
          <Feather 
            name="pie-chart" 
            size={18} 
            color={activeSection === 'nutrition' ? '#3E6B89' : '#8896AB'} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeSection === 'nutrition' && styles.activeTabText
            ]}
          >
            Nutrition
          </Text>
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            styles.tabIndicator,
            {
              transform: [{ translateX: tabIndicatorPosition }],
            }
          ]}
        />
      </View>
    </View>
  );

  const renderHealthInfo = () => {
    if (activeSection !== 'health') return null;
    
    return (
      <Animated.View 
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Feather name="activity" size={20} color="#3E6B89" />
            <Text style={styles.sectionTitle}>Health Information</Text>
          </View>
        </View>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <FontAwesome5 name="weight" size={16} color="#3E6B89" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>BMI</Text>
              <Text style={styles.infoValue}>{profileData?.bmi || '-'}</Text>
              <Text style={styles.infoDescription}>Body Mass Index</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <MaterialCommunityIcons name="fire" size={18} color="#FF6B6B" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>BMR</Text>
              <Text style={styles.infoValue}>{profileData?.bmr || '-'} kcal</Text>
              <Text style={styles.infoDescription}>Basal Metabolic Rate</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <MaterialCommunityIcons name="lightning-bolt" size={18} color="#FFD93D" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>TDEE</Text>
              <Text style={styles.infoValue}>{profileData?.tdee || '-'} kcal</Text>
              <Text style={styles.infoDescription}>Total Daily Energy Expenditure</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <MaterialCommunityIcons name="run" size={18} color="#6BCB77" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Activity Level</Text>
              <Text style={styles.infoValue}>{profileData?.activityLevel || '-'}</Text>
              <Text style={styles.infoDescription}>Daily physical activity</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderPersonalStats = () => {
    if (activeSection !== 'stats') return null;
    
    return (
      <Animated.View 
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Feather name="user" size={20} color="#3E6B89" />
            <Text style={styles.sectionTitle}>Personal Stats</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.detailedStatItem}>
              <Text style={styles.statLabel}>Age</Text>
              <Text style={styles.statValue}>{profileData?.age || '-'} years</Text>
            </View>
            <View style={styles.detailedStatItem}>
              <Text style={styles.statLabel}>Gender</Text>
              <Text style={styles.statValue}>{profileData?.gender || '-'}</Text>
            </View>
          </View>
          
          <View style={styles.statRow}>
            <View style={styles.detailedStatItem}>
              <Text style={styles.statLabel}>Height</Text>
              <Text style={styles.statValue}>{profileData?.height || '-'} cm</Text>
            </View>
            <View style={styles.detailedStatItem}>
              <Text style={styles.statLabel}>Weight</Text>
              <Text style={styles.statValue}>{profileData?.weight || '-'} kg</Text>
            </View>
          </View>
          
          <View style={styles.statRow}>
            <View style={styles.detailedStatItem}>
              <Text style={styles.statLabel}>Goal Weight</Text>
              <Text style={styles.statValue}>{profileData?.goalWeight || '-'} kg</Text>
            </View>
            <View style={styles.detailedStatItem}>
              <Text style={styles.statLabel}>Weight Change Rate</Text>
              <Text style={styles.statValue}>{profileData?.weightchangeRate || '-'} kg/week</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.weightGoalCard}>
          <View style={styles.weightGoalHeader}>
            <Text style={styles.weightGoalTitle}>Weight Goal Progress</Text>
            <Text style={styles.weightGoalSubtitle}>
              {profileData?.goalWeight > profileData?.weight ? 'Gain' : 'Loss'} Goal
            </Text>
          </View>
          
          <View style={styles.weightGoalProgress}>
            <View style={styles.progressLabels}>
              <Text style={styles.currentWeightLabel}>Current: {profileData?.weight || '-'} kg</Text>
              <Text style={styles.goalWeightLabel}>Goal: {profileData?.goalWeight || '-'} kg</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                {profileData?.weight && profileData?.goalWeight && (
                  <View 
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          Math.max(
                            ((profileData.weight - (profileData.goalWeight < profileData.weight ? profileData.goalWeight : 0)) / 
                            Math.abs(profileData.goalWeight - profileData.weight)) * 100,
                            0
                          ),
                          100
                        )}%`,
                      }
                    ]}
                  />
                )}
              </View>
            </View>
            
            <Text style={styles.weightDifferenceText}>
              {profileData?.weight && profileData?.goalWeight ? 
                `${Math.abs(profileData.weight - profileData.goalWeight).toFixed(1)} kg to go` : 
                'Set your goal weight'
              }
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderNutritionGoals = () => {
    if (activeSection !== 'nutrition') return null;
    
    return (
      <Animated.View 
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Feather name="pie-chart" size={20} color="#3E6B89" />
            <Text style={styles.sectionTitle}>Nutrition Goals</Text>
          </View>
        </View>
        
        <View style={styles.calorieCard}>
          <View style={styles.calorieHeader}>
            <MaterialCommunityIcons name="fire" size={24} color="#FF6B6B" />
            <Text style={styles.calorieTitle}>Daily Calorie Goal</Text>
          </View>
          
          <Text style={styles.calorieValue}>{profileData?.goalCalories || '-'}</Text>
          
          <View style={styles.calorieDistribution}>
            <View style={styles.macroPercentage}>
              <View 
                style={[
                  styles.percentageFill, 
                  { 
                    backgroundColor: '#4D96FF',
                    width: `${profileData?.macros?.protein ? 
                      (profileData.macros.protein * 4 / profileData.goalCalories) * 100 : 30}%` 
                  }
                ]}
              />
            </View>
            <View style={styles.macroPercentage}>
              <View 
                style={[
                  styles.percentageFill, 
                  { 
                    backgroundColor: '#6BCB77',
                    width: `${profileData?.macros?.carbs ? 
                      (profileData.macros.carbs * 4 / profileData.goalCalories) * 100 : 40}%` 
                  }
                ]}
              />
            </View>
            <View style={styles.macroPercentage}>
              <View 
                style={[
                  styles.percentageFill, 
                  { 
                    backgroundColor: '#FFD93D',
                    width: `${profileData?.macros?.fats ? 
                      (profileData.macros.fats * 9 / profileData.goalCalories) * 100 : 30}%` 
                  }
                ]}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <View style={[styles.macroIconContainer, { backgroundColor: '#4D96FF20' }]}>
              <MaterialCommunityIcons name="food-steak" size={24} color="#4D96FF" />
            </View>
            <View style={styles.macroContent}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{profileData?.macros?.protein || '-'} g</Text>
              <Text style={styles.macroPercentText}>
                {profileData?.macros?.protein && profileData?.goalCalories ? 
                  `${Math.round((profileData.macros.protein * 4 / profileData.goalCalories) * 100)}%` : 
                  '-'
                }
              </Text>
            </View>
          </View>
          
          <View style={styles.macroItem}>
            <View style={[styles.macroIconContainer, { backgroundColor: '#6BCB7720' }]}>
              <MaterialCommunityIcons name="bread-slice" size={24} color="#6BCB77" />
            </View>
            <View style={styles.macroContent}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{profileData?.macros?.carbs || '-'} g</Text>
              <Text style={styles.macroPercentText}>
                {profileData?.macros?.carbs && profileData?.goalCalories ? 
                  `${Math.round((profileData.macros.carbs * 4 / profileData.goalCalories) * 100)}%` : 
                  '-'
                }
              </Text>
            </View>
          </View>
          
          <View style={styles.macroItem}>
            <View style={[styles.macroIconContainer, { backgroundColor: '#FFD93D20' }]}>
              <MaterialCommunityIcons name="oil" size={24} color="#FFD93D" />
            </View>
            <View style={styles.macroContent}>
              <Text style={styles.macroLabel}>Fats</Text>
              <Text style={styles.macroValue}>{profileData?.macros?.fats || '-'} g</Text>
              <Text style={styles.macroPercentText}>
                {profileData?.macros?.fats && profileData?.goalCalories ? 
                  `${Math.round((profileData.macros.fats * 9 / profileData.goalCalories) * 100)}%` : 
                  '-'
                }
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderSettings = () => (
    <Animated.View 
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Feather name="settings" size={20} color="#3E6B89" />
          <Text style={styles.sectionTitle}>Settings</Text>
        </View>
      </View>
      
      <View style={styles.settingsContainer}>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={22} color="#2E3A59" />
            <Text style={styles.settingLabel}>Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#E5E9F0', true: '#3E6B89' }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="lock-closed-outline" size={22} color="#2E3A59" />
            <Text style={styles.settingLabel}>Change Password</Text>
          </View>
          <Feather name="chevron-right" size={22} color="#8896AB" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="food-apple-outline" size={22} color="#2E3A59" />
            <Text style={styles.settingLabel}>Dietary Preferences</Text>
          </View>
          <Feather name="chevron-right" size={22} color="#8896AB" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Feather name="help-circle" size={22} color="#2E3A59" />
            <Text style={styles.settingLabel}>Help & Support</Text>
          </View>
          <Feather name="chevron-right" size={22} color="#8896AB" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Feather name="info" size={22} color="#2E3A59" />
            <Text style={styles.settingLabel}>About</Text>
          </View>
          <Feather name="chevron-right" size={22} color="#8896AB" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Feather name="log-out" size={18} color="#fff" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#3E6B89" />
        <ActivityIndicator size="large" color="#3E6B89" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3E6B89" />
      
      {/* Compact Header (shows when scrolling) */}
      {renderCompactHeader()}
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3E6B89']}
            tintColor="#3E6B89"
            progressBackgroundColor="#ffffff"
          />
        }
      >
        {/* Profile Header */}
        {renderProfileHeader()}
        
        {/* Tab Bar */}
        {renderTabBar()}
        
        {/* Content Sections */}
        {renderHealthInfo()}
        {renderPersonalStats()}
        {renderNutritionGoals()}
        {renderSettings()}
        
        {/* Bottom padding */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8896AB',
  },
  // Header Styles
  compactHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    zIndex: 10,
    justifyContent: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  compactHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
    textAlign: 'center',
  },
  profileHeader: {
    height: Platform.OS === 'ios' ? 280 : 260,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 30 : 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'center',
  },
  editButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  // Tab Bar Styles
  tabBarContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    zIndex: 5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    zIndex: 1,
  },
  activeTabItem: {
    // Styles applied via the indicator
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8896AB',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#3E6B89',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: (width - 40) / 3 - 8,
    height: 40,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    zIndex: 0,
  },
  // Section Styles
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
    marginLeft: 8,
  },
  // Health Info Styles
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8896AB',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: 10,
    color: '#8896AB',
  },
  // Stats Styles
  statsContainer: {
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailedStatItem: {
    width: '48%',
  },
  weightGoalCard: {
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    padding: 16,
  },
  weightGoalHeader: {
    marginBottom: 16,
  },
  weightGoalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 4,
  },
  weightGoalSubtitle: {
    fontSize: 12,
    color: '#8896AB',
  },
  weightGoalProgress: {
    marginBottom: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  currentWeightLabel: {
    fontSize: 12,
    color: '#2E3A59',
  },
  goalWeightLabel: {
    fontSize: 12,
    color: '#2E3A59',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E9F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3E6B89',
    borderRadius: 4,
  },
  weightDifferenceText: {
    fontSize: 12,
    color: '#8896AB',
    textAlign: 'center',
  },
  // Nutrition Styles
  calorieCard: {
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  calorieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calorieTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
    marginLeft: 8,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 16,
    textAlign: 'center',
  },
  calorieDistribution: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: '#E5E9F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  macroPercentage: {
    height: '100%',
  },
  percentageFill: {
    height: '100%',
  },
  macrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  macroItem: {
    width: '31%',
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  macroIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroContent: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    color: '#8896AB',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 2,
  },
  macroPercentText: {
    fontSize: 12,
    color: '#8896AB',
  },
  // Settings Styles
  settingsContainer: {
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#2E3A59',
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default ClientProfileScreen;