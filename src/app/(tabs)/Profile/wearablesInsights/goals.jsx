import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import axios from 'axios';
import {useuserDetailContext} from '../../../context/UserDetailContext'
import {URL} from '../../../../constants/url'

const { width } = Dimensions.get('window');

const UserHealthDashboard = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {userDetail} = useuserDetailContext();
  const userId = userDetail?.userId;

  // Function to fetch health data
  const fetchHealthData = async () => {
    if (!userId) {
      setError('User ID not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Make the actual API call to fetch live data
      const response = await axios.get(`${URL}/regular/health-dashboard/${userId}`);
      
      // Process the response data to match the expected format in our component
      const responseData = response.data;
      
      if (responseData.success) {
        // Transform response data to match the format our component expects
        const formattedData = {
          name: responseData.data.personalInfo.name,
          age: responseData.data.personalInfo.age,
          gender: responseData.data.personalInfo.gender,
          height: responseData.data.personalInfo.height,
          weight: responseData.data.personalInfo.weight,
          goalWeight: responseData.data.personalInfo.goalWeight,
          bmi: responseData.data.bmiData.bmi,
          tdee: responseData.data.energyBalance.tdee,
          bmr: responseData.data.energyBalance.bmr,
          goalCalories: responseData.data.energyBalance.goalCalories,
          macros: {
            protein: responseData.data.macronutrients.distribution.protein,
            carbs: responseData.data.macronutrients.distribution.carbs,
            fat: responseData.data.macronutrients.distribution.fats
          },
          dailyProtein: responseData.data.macronutrients.dailyTargets.protein,
          dailyCarbs: responseData.data.macronutrients.dailyTargets.carbs,
          dailyNonFiberCarbs: responseData.data.macronutrients.dailyTargets.nonFiberCarbs,
          dailyFiber: responseData.data.macronutrients.dailyTargets.fiber,
          dailyFat: responseData.data.macronutrients.dailyTargets.fats,
          activityLevel: responseData.data.personalInfo.activityLevel,
          weightHistory: responseData.data.weightProgress.history.length > 0 ? 
            responseData.data.weightProgress.history.map(item => ({
              date: item.date,
              value: item.weight
            })) : 
            // If no history, create some dummy points based on current weight
            [
              { date: 'Jan', value: parseFloat(responseData.data.personalInfo.weight) },
              { date: 'Now', value: parseFloat(responseData.data.personalInfo.weight) }
            ],
          waterGoal: parseFloat(responseData.data.dailyGoals.water),
          sleepGoal: responseData.data.dailyGoals.sleep,
          bmiCategory: responseData.data.bmiData.category,
          idealWeight: responseData.data.bmiData.idealWeight,
          weightGoalInfo: responseData.data.weightProgress.toGoal
        };
        
        setUserData(formattedData);
      } else {
        setError('Failed to fetch health data');
      }
    } catch (error) {
      console.error('Error fetching health data:', error.response || error.message);
      setError(error.message || 'An error occurred while fetching health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, [userId]);

  // Animation values
  const cardAnimation = useSharedValue(1);
  
  const toggleCardExpansion = (cardId) => {
    if (expandedCard === cardId) {
      setExpandedCard(null);
      cardAnimation.value = withTiming(1, { duration: 300 });
    } else {
      setExpandedCard(cardId);
      cardAnimation.value = withTiming(1.05, { duration: 300 });
    }
  };
  
  const getBmiCategory = () => {
    if (!userData || !userData.bmiCategory) {
      // Default fallback based on BMI value
      if (userData && userData.bmi < 18.5) return { category: 'Underweight', color: '#3498db' };
      if (userData && userData.bmi < 25) return { category: 'Normal', color: '#2ecc71' };
      if (userData && userData.bmi < 30) return { category: 'Overweight', color: '#f39c12' };
      return { category: 'Obese', color: '#e74c3c' };
    }
    
    // Use the category from API data
    return userData.bmiCategory;
  };
  
  const getWeightDifference = () => {
    if (!userData) return '';
    
    if (userData.weightGoalInfo) {
      const { amount, direction } = userData.weightGoalInfo;
      return `${amount} kg to ${direction}`;
    }
    
    // Fallback to basic calculation
    const diff = userData.weight - userData.goalWeight;
    return diff > 0 ? `${diff} kg to lose` : diff < 0 ? `${Math.abs(diff)} kg to gain` : 'Weight goal reached!';
  };
  
  const calculateCalorieDeficit = () => {
    return userData.tdee - userData.goalCalories;
  };
  
  const renderMacrosPieChart = () => {
    const data = [
      {
        name: 'Protein',
        percentage: userData.macros.protein,
        color: '#4CAF50',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
      {
        name: 'Carbs',
        percentage: userData.macros.carbs,
        color: '#2196F3',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
      {
        name: 'Fat',
        percentage: userData.macros.fat,
        color: '#FF9800',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
    ];

    return (
      <PieChart
        data={data}
        width={width - 60}
        height={180}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="percentage"
        backgroundColor="transparent"
        paddingLeft="0"
        absolute={false}
        hasLegend={true}
        center={[0, 0]}
      />
    );
  };
  
  const renderWeightHistoryChart = () => {
    // Check if we have weight history data
    if (!userData.weightHistory || userData.weightHistory.length < 2) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Not enough weight history data to display chart</Text>
        </View>
      );
    }
    
    return (
      <LineChart
        data={{
          labels: userData.weightHistory.map(item => item.date),
          datasets: [
            {
              data: userData.weightHistory.map(item => item.value),
            },
          ],
        }}
        width={width - 40}
        height={180}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(94, 96, 206, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#5E60CE',
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    );
  };
  
  const renderProgressBar = (current, target, label, color = '#5E60CE') => {
    const progress = Math.min(current / target, 1);
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressLabelContainer}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressValue}>{current} / {target}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: color }]} />
        </View>
      </View>
    );
  };
  
  const renderContent = () => {
    if (!userData) return null;

    const bmiInfo = getBmiCategory();
    const bmiValue = parseFloat(userData.bmi) || 0;
    const currentWeight = parseFloat(userData.weight) || 0;
    const goalWeight = parseFloat(userData.goalWeight) || currentWeight;
    const startWeight = userData.weightHistory?.[0]?.value || currentWeight;

    return (
      <View style={styles.tabContent}>
        {/* BMI Card */}
        <TouchableOpacity 
          style={[styles.card, expandedCard === 'bmi' && styles.expandedCard]} 
          onPress={() => toggleCardExpansion('bmi')}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <FontAwesome5 name="weight" size={18} color="#2196F3" />
              <Text style={styles.cardTitle}>Body Mass Index (BMI)</Text>
            </View>
            <Feather 
              name={expandedCard === 'bmi' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#666" 
            />
          </View>
          
          <View style={styles.bmiContent}>
            <View style={styles.bmiValueContainer}>
              <Text style={[styles.bmiValue, { color: bmiInfo.color }]}>
                {bmiValue.toFixed(1)}
              </Text>
              <Text style={[styles.bmiCategory, { color: bmiInfo.color }]}>
                {bmiInfo.category}
              </Text>
            </View>
            
            {expandedCard === 'bmi' && (
              <>
                <View style={styles.bmiScaleContainer}>
                  <View style={styles.bmiScale}>
                    <View style={[styles.bmiScaleSection, { flex: 1, backgroundColor: '#3498db' }]} />
                    <View style={[styles.bmiScaleSection, { flex: 1, backgroundColor: '#2ecc71' }]} />
                    <View style={[styles.bmiScaleSection, { flex: 1, backgroundColor: '#f39c12' }]} />
                    <View style={[styles.bmiScaleSection, { flex: 1, backgroundColor: '#e74c3c' }]} />
                  </View>
                  <View style={styles.bmiScaleLabels}>
                    <Text style={styles.bmiScaleLabel}>Underweight</Text>
                    <Text style={styles.bmiScaleLabel}>Normal</Text>
                    <Text style={styles.bmiScaleLabel}>Overweight</Text>
                    <Text style={styles.bmiScaleLabel}>Obese</Text>
                  </View>
                  <View style={styles.bmiScaleValues}>
                    <Text style={styles.bmiScaleValue}>18.5</Text>
                    <Text style={styles.bmiScaleValue}>25</Text>
                    <Text style={styles.bmiScaleValue}>30</Text>
                  </View>
                </View>
                
                <View style={styles.bmiInfoContainer}>
                  <Text style={styles.bmiInfoText}>
                    Your BMI of {bmiValue.toFixed(1)} indicates you are in the {bmiInfo.category} range.
                    Based on your height, an ideal weight would be around {userData.idealWeight} kg.
                  </Text>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Weight History Card */}
        <TouchableOpacity 
          style={[styles.card, expandedCard === 'history' && styles.expandedCard]} 
          onPress={() => toggleCardExpansion('history')}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="trending-down" size={18} color="#4CAF50" />
              <Text style={styles.cardTitle}>Weight Progress</Text>
            </View>
            <Feather 
              name={expandedCard === 'history' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#666" 
            />
          </View>
          
          {expandedCard === 'history' ? (
            <View style={styles.historyContent}>
              {renderWeightHistoryChart()}
              <View style={styles.historyStats}>
                <View style={styles.historyStat}>
                  <Text style={styles.historyStatLabel}>Starting</Text>
                  <Text style={styles.historyStatValue}>{startWeight} kg</Text>
                </View>
                <View style={styles.historyStat}>
                  <Text style={styles.historyStatLabel}>Current</Text>
                  <Text style={styles.historyStatValue}>{currentWeight} kg</Text>
                </View>
                <View style={styles.historyStat}>
                  <Text style={styles.historyStatLabel}>Goal</Text>
                  <Text style={styles.historyStatValue}>{goalWeight} kg</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.historyPreview}>
              <Text style={styles.historyPreviewText}>
                Current: {currentWeight} kg • Goal: {goalWeight} kg
              </Text>
              <Text style={styles.historyPreviewText}>
                {currentWeight === goalWeight ? 'Target reached!' : getWeightDifference()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Energy Card */}
        <TouchableOpacity 
          style={[styles.card, expandedCard === 'energy' && styles.expandedCard]} 
          onPress={() => toggleCardExpansion('energy')}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="fire" size={18} color="#FF9800" />
              <Text style={styles.cardTitle}>Energy Balance</Text>
            </View>
            <Feather 
              name={expandedCard === 'energy' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#666" 
            />
          </View>
          
          <View style={styles.energyContent}>
            <View style={styles.energyRow}>
              <View style={styles.energyItem}>
                <Text style={styles.energyValue}>{userData.tdee}</Text>
                <Text style={styles.energyLabel}>TDEE</Text>
                <Text style={styles.energyUnit}>calories/day</Text>
              </View>
              
              <View style={styles.energyDivider} />
              
              <View style={styles.energyItem}>
                <Text style={styles.energyValue}>{userData.goalCalories}</Text>
                <Text style={styles.energyLabel}>Target</Text>
                <Text style={styles.energyUnit}>calories/day</Text>
              </View>
            </View>
            
            {expandedCard === 'energy' && (
              <View style={styles.detailedEnergyInfo}>
                <View style={styles.divider} />
                
                <View style={styles.energyInfoRow}>
                  <Text style={styles.energyInfoLabel}>Basal Metabolic Rate</Text>
                  <Text style={styles.energyInfoValue}>{userData.bmr} cal</Text>
                </View>
                
                <View style={styles.energyInfoRow}>
                  <Text style={styles.energyInfoLabel}>Activity Level</Text>
                  <Text style={styles.energyInfoValue}>{userData.activityLevel}</Text>
                </View>
                
                <View style={styles.energyInfoRow}>
                  <Text style={styles.energyInfoLabel}>Daily Calorie Target</Text>
                  <Text style={styles.energyInfoValue}>{userData.goalCalories} cal</Text>
                </View>
                
                <View style={styles.energyInfoRow}>
                  <Text style={styles.energyInfoLabel}>Calorie Deficit/Surplus</Text>
                  <Text style={[
                    styles.energyInfoValue,
                    { color: calculateCalorieDeficit() > 0 ? '#4CAF50' : calculateCalorieDeficit() < 0 ? '#e74c3c' : '#333333' }
                  ]}>
                    {Math.abs(calculateCalorieDeficit())} cal {calculateCalorieDeficit() > 0 ? 'deficit' : calculateCalorieDeficit() < 0 ? 'surplus' : ''}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Macros Card */}
        <TouchableOpacity 
          style={[styles.card, expandedCard === 'macros' && styles.expandedCard]} 
          onPress={() => toggleCardExpansion('macros')}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="food-apple" size={18} color="#4CAF50" />
              <Text style={styles.cardTitle}>Macronutrients</Text>
            </View>
            <Feather 
              name={expandedCard === 'macros' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#666" 
            />
          </View>
          
          <View style={styles.macrosContent}>
            <View style={styles.macrosRow}>
              <View style={styles.macroItem}>
                <View style={[styles.macroIcon, { backgroundColor: '#4CAF50' }]}>
                  <Text style={styles.macroIconText}>P</Text>
                </View>
                <Text style={styles.macroValue}>{userData.macros.protein}%</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              
              <View style={styles.macroItem}>
                <View style={[styles.macroIcon, { backgroundColor: '#2196F3' }]}>
                  <Text style={styles.macroIconText}>C</Text>
                </View>
                <Text style={styles.macroValue}>{userData.macros.carbs}%</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              
              <View style={styles.macroItem}>
                <View style={[styles.macroIcon, { backgroundColor: '#FF9800' }]}>
                  <Text style={styles.macroIconText}>F</Text>
                </View>
                <Text style={styles.macroValue}>{userData.macros.fat}%</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>
            
            {expandedCard === 'macros' && (
              <>
                <View style={styles.macrosChartContainer}>
                  {renderMacrosPieChart()}
                </View>
                
                <View style={styles.macrosCalculation}>
                  <Text style={styles.macrosCalcTitle}>Daily Targets</Text>
                  
                  <View style={styles.macrosCalcRow}>
                    <Text style={styles.macrosCalcLabel}>Protein</Text>
                    <Text style={styles.macrosCalcValue}>{userData.dailyProtein} g</Text>
                  </View>
                  
                  <View style={styles.macrosCalcRow}>
                    <Text style={styles.macrosCalcLabel}>Total Carbohydrates</Text>
                    <Text style={styles.macrosCalcValue}>{userData.dailyCarbs} g</Text>
                  </View>
                  
                  <View style={styles.macrosCalcRow}>
                    <Text style={styles.macrosCalcLabel}>-- Non-Fiber Carbs</Text>
                    <Text style={styles.macrosCalcValue}>{userData.dailyNonFiberCarbs} g</Text>
                  </View>
                  
                  <View style={styles.macrosCalcRow}>
                    <Text style={styles.macrosCalcLabel}>-- Fiber</Text>
                    <Text style={styles.macrosCalcValue}>{userData.dailyFiber} g</Text>
                  </View>
                  
                  <View style={styles.macrosCalcRow}>
                    <Text style={styles.macrosCalcLabel}>Fat</Text>
                    <Text style={styles.macrosCalcValue}>{userData.dailyFat} g</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Daily Goals Card */}
        <TouchableOpacity 
          style={[styles.card, expandedCard === 'goals' && styles.expandedCard]} 
          onPress={() => toggleCardExpansion('goals')}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Feather name="target" size={18} color="#5E60CE" />
              <Text style={styles.cardTitle}>Daily Goals</Text>
            </View>
            <Feather 
              name={expandedCard === 'goals' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#666" 
            />
          </View>
          
          <View style={styles.goalsContent}>
            {renderProgressBar(1100, userData.goalCalories, 'Calories', '#FF9800')}
            {renderProgressBar(1.0, userData.waterGoal, 'Water (L)', '#2196F3')}
            {renderProgressBar(6, userData.sleepGoal, 'Sleep (hrs)', '#5E60CE')}
            
            {expandedCard === 'goals' && (
              <>
                <View style={styles.divider} />
                <Text style={styles.bmiInfoText}>
                  Track your daily progress to reach your health goals. You can update these values in the settings section.
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Add loading state component
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5E60CE" />
          <Text style={styles.loadingText}>Loading health data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Add error state component
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchHealthData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Health Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Hello, {userData?.name || 'User'}
          </Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Feather name="settings" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {userData ? renderContent() : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    marginTop:15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  settingsButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  tabContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expandedCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#eeeeee',
    marginVertical: 12,
  },
  
  // Summary Card Styles
  summaryContent: {
    paddingTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  
  // Energy Card Styles
  energyContent: {
    paddingTop: 4,
  },
  energyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  energyItem: {
    alignItems: 'center',
    flex: 1,
  },
  energyLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  energyValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  energyUnit: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  energyDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#eeeeee',
  },
  detailedEnergyInfo: {
    marginTop: 8,
  },
  energyInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  energyInfoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  energyInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  
  // BMI Card Styles
  bmiContent: {
    alignItems: 'center',
    paddingTop: 4,
  },
  bmiValueContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  bmiCategory: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  bmiScaleContainer: {
    width: '100%',
    marginTop: 16,
  },
  bmiScale: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  bmiScaleSection: {
    height: '100%',
  },
bmiScaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  bmiScaleLabel: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    flex: 1,
  },
  bmiScaleValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingLeft: '25%',
    paddingRight: '25%',
  },
  bmiScaleValue: {
    fontSize: 10,
    color: '#666666',
  },
  bmiInfoContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  bmiInfoText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Weight History Card Styles
  historyContent: {
    paddingTop: 8,
  },
  historyPreview: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  historyPreviewText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  historyStat: {
    alignItems: 'center',
    flex: 1,
  },
  historyStatLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  historyStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  noDataContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  
  // Macros Card Styles
  macrosContent: {
    paddingTop: 4,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  macroIconText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666666',
  },
  macrosChartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  macrosCalculation: {
    marginTop: 8,
  },
  macrosCalcTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  macrosCalcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  macrosCalcLabel: {
    fontSize: 14,
    color: '#666666',
  },
  macrosCalcValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  
  // Progress Bar Styles
  goalsContent: {
    paddingTop: 8,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666666',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  
  // Loading & Error Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#5E60CE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default UserHealthDashboard;