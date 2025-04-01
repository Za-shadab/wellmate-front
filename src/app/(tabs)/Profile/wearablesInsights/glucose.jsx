import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image as RNImage,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Circle, G, SvgText, SvgRect } from 'react-native-svg';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Simplified mock data for glucose readings (removed meal references)
const mockGlucoseData = [
  { timestamp: '00:00', value: 102 },
  { timestamp: '01:00', value: 98 },
  { timestamp: '02:00', value: 95 },
  { timestamp: '03:00', value: 91 },
  { timestamp: '04:00', value: 88 },
  { timestamp: '05:00', value: 85 },
  { timestamp: '06:00', value: 83 },
  { timestamp: '07:00', value: 88 },
  { timestamp: '08:00', value: 132 },
  { timestamp: '09:00', value: 120 },
  { timestamp: '10:00', value: 108 },
  { timestamp: '11:00', value: 98 },
  { timestamp: '12:00', value: 95 },
  { timestamp: '13:00', value: 145 },
  { timestamp: '14:00', value: 130 },
  { timestamp: '15:00', value: 118 },
  { timestamp: '16:00', value: 112 },
  { timestamp: '17:00', value: 125 },
  { timestamp: '18:00', value: 115 },
  { timestamp: '19:00', value: 105 },
  { timestamp: '20:00', value: 138 },
  { timestamp: '21:00', value: 126 },
  { timestamp: '22:00', value: 115 },
  { timestamp: '23:00', value: 108 },
];

// Mock data for insights
const insightsMockData = [
  {
    id: 1,
    title: 'Breakfast Impact',
    description: 'Your glucose spiked 44 mg/dL after breakfast. Consider reducing carb content.',
    severity: 'warning',
    mealType: 'breakfast',
  },
  {
    id: 2,
    title: 'Steady Afternoon',
    description: 'Your post-lunch glucose was well managed. The protein-rich meal helped maintain stable levels.',
    severity: 'positive',
    mealType: 'lunch',
  },
  {
    id: 3,
    title: 'Evening Pattern',
    description: 'Your glucose rises significantly after dinner despite moderate carb intake. Consider an evening walk to help lower these levels.',
    severity: 'caution',
    mealType: 'dinner',
  },
  {
    id: 4,
    title: 'Fasting Levels',
    description: 'Your fasting glucose is within healthy range. Keep maintaining your overnight habits.',
    severity: 'positive',
    mealType: 'fasting',
  },
];

// Get daily glucose statistics
const getDailyStats = (data) => {
  if (!data || data.length === 0) return { avg: 0, min: 0, max: 0 };
  
  const values = data.map(item => item.value);
  return {
    avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    min: Math.min(...values),
    max: Math.max(...values),
  };
};

// Helper function to determine glucose level status
const getGlucoseStatus = (value) => {
  if (value < 70) return { status: 'Low', color: '#E53E3E' };
  if (value < 80) return { status: 'Slightly Low', color: '#ED8936' };
  if (value < 140) return { status: 'Normal', color: '#38A169' };
  if (value < 180) return { status: 'Elevated', color: '#DD6B20' };
  return { status: 'High', color: '#E53E3E' };
};

// Helper function to get gradient colors based on glucose value
const getGradientColors = (value) => {
  if (value < 70) return ['#FEB2B2', '#FC8181'];
  if (value < 80) return ['#FEEBC8', '#FBD38D'];
  if (value < 140) return ['#C6F6D5', '#9AE6B4'];
  if (value < 180) return ['#FEEBC8', '#F6AD55'];
  return ['#FEB2B2', '#FC8181'];
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('day');
  const [connectingDevice, setConnectingDevice] = useState(false);
  const [activeInsight, setActiveInsight] = useState(null);
  const [selectedGlucosePoint, setSelectedGlucosePoint] = useState(null);
  const [glucoseData, setGlucoseData] = useState([]);
  const [insights, setInsights] = useState([]);
  const router = useRouter();

  // Simulating data fetch from API/smartwatch
  useEffect(() => {
    const fetchData = async () => {
      // Simulate API call
      setTimeout(() => {
        setGlucoseData(mockGlucoseData);
        setInsights(insightsMockData);
        setLoading(false);
      }, 1500);
    };

    fetchData();
  }, []);

  // Current glucose value (latest reading)
  const currentGlucose = !loading && glucoseData.length > 0 
    ? glucoseData[glucoseData.length - 1].value 
    : 0;
  
  const dailyStats = getDailyStats(glucoseData);
  const currentStatus = getGlucoseStatus(currentGlucose);

  const handleConnectDevice = () => {
    setConnectingDevice(true);
    // Simulate connection process
    setTimeout(() => {
      setConnectingDevice(false);
    }, 2000);
  };

  const renderGlucoseGraph = () => {
    if (loading || glucoseData.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5A67D8" />
          <Text style={styles.loadingText}>Loading glucose data...</Text>
        </View>
      );
    }

    // Extract data for the chart - show fewer labels for cleaner UI
    const data = {
      labels: glucoseData.filter((_, i) => i % 6 === 0).map(d => d.timestamp),
      datasets: [
        {
          data: glucoseData.map(d => d.value),
          color: (opacity = 1) => `rgba(90, 103, 216, ${opacity})`, // Indigo color with opacity
          strokeWidth: 2
        }
      ],
      legend: ["Glucose (mg/dL)"]
    };

    // Chart configuration
    const chartConfig = {
      backgroundColor: "#fff",
      backgroundGradientFrom: "#fff",
      backgroundGradientTo: "#fff",
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(90, 103, 216, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(113, 128, 150, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: "#fff"
      },
      propsForBackgroundLines: {
        strokeDasharray: "5,5",
        strokeWidth: 1,
      },
      propsForVerticalLabels: {
        fontSize: 10,
        rotation: 0,
      },
      formatYLabel: (yValue) => `${Math.round(parseFloat(yValue))}`,
    };

    return (
      <View style={styles.graphContainer}>
        <View style={styles.chartWrapper}>
          <LineChart
            data={data}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={false}
            segments={4}
            onDataPointClick={({index}) => setSelectedGlucosePoint(index === selectedGlucosePoint ? null : index)}
            renderDotContent={({x, y, index}) => {
              const point = glucoseData[index];
              const isSelected = selectedGlucosePoint === index;
              
              return isSelected ? (
                <G key={index}>
                  <Circle
                    cx={x}
                    cy={y}
                    r={10}
                    fill="transparent"
                    stroke="#5A67D8"
                    strokeWidth={1}
                    strokeDasharray="2,2"
                  />
                  
                  <SvgRect
                    x={x - 35}
                    y={y - 50}
                    width={70}
                    height={30}
                    rx={5}
                    fill="#5A67D8"
                  />
                  
                  <SvgText
                    x={x}
                    y={y - 30}
                    fontSize={12}
                    fontWeight="bold"
                    fill="#FFFFFF"
                    textAnchor="middle"
                  >
                    {point.value} mg/dL
                  </SvgText>
                </G>
              ) : null;
            }}
            style={styles.chart}
          />
          
          {/* Reference Lines */}
          <View style={[styles.referenceLine, { top: '25%', borderColor: '#E53E3E', borderWidth: 1, borderStyle: 'dashed' }]}>
            <Text style={[styles.referenceLabel, { color: '#E53E3E' }]}>180</Text>
          </View>
          <View style={[styles.referenceLine, { top: '55%', borderColor: '#38A169', borderWidth: 1, borderStyle: 'dashed' }]}>
            <Text style={[styles.referenceLabel, { color: '#38A169' }]}>140</Text>
          </View>
          <View style={[styles.referenceLine, { top: '75%', borderColor: '#E53E3E', borderWidth: 1, borderStyle: 'dashed' }]}>
            <Text style={[styles.referenceLabel, { color: '#E53E3E' }]}>70</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderInsightCard = (item) => {
    const isActive = activeInsight === item.id;
    
    let iconName = 'information-circle-outline';
    let iconColor = '#4299E1';
    
    switch (item.severity) {
      case 'warning':
        iconName = 'warning-outline';
        iconColor = '#ED8936';
        break;
      case 'positive':
        iconName = 'checkmark-circle-outline';
        iconColor = '#38A169';
        break;
      case 'caution':
        iconName = 'alert-circle-outline';
        iconColor = '#ECC94B';
        break;
    }
    
    let mealIcon = 'silverware-fork-knife';
    switch (item.mealType) {
      case 'breakfast':
        mealIcon = 'coffee-outline';
        break;
      case 'lunch':
        mealIcon = 'restaurant-outline';
        break;
      case 'dinner':
        mealIcon = 'moon-outline';
        break;
      case 'fasting':
        mealIcon = 'timer-outline';
        break;
    }
    
    return (
      <TouchableOpacity
        style={[
          styles.insightCard,
          isActive && styles.insightCardActive
        ]}
        activeOpacity={0.8}
        onPress={() => setActiveInsight(isActive ? null : item.id)}
      >
        <View style={styles.insightHeader}>
          <View style={[styles.insightIconContainer, { backgroundColor: `${iconColor}20` }]}>
            <Ionicons name={iconName} size={20} color={iconColor} />
          </View>
          <Text style={styles.insightTitle}>{item.title}</Text>
          <View style={[styles.mealIconContainer, { backgroundColor: '#7C3AED20' }]}>
            <Ionicons name={mealIcon} size={16} color="#7C3AED" />
          </View>
        </View>
        
        <Text style={styles.insightDescription}>{item.description}</Text>
        
        {isActive && (
          <View style={styles.insightActions}>
            <TouchableOpacity style={styles.insightButton}>
              <Text style={styles.insightButtonText}>Learn More</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.insightButton, styles.insightButtonOutline]}
            >
              <Text style={[styles.insightButtonText, styles.insightButtonTextOutline]}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTimeRangeSelector = () => {
    const timeRanges = [
      { id: 'day', label: 'Day' },
      { id: 'week', label: 'Week' },
      { id: 'month', label: 'Month' },
    ];
    
    return (
      <View style={styles.timeRangeContainer}>
        {timeRanges.map((range) => (
          <TouchableOpacity 
            key={range.id}
            style={[
              styles.timeRangeButton,
              selectedTimeRange === range.id && styles.timeRangeButtonActive
            ]}
            onPress={() => setSelectedTimeRange(range.id)}
          >
            <Text 
              style={[
                styles.timeRangeText,
                selectedTimeRange === range.id && styles.timeRangeTextActive
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={()=>{router.back()}}>
          <Ionicons name="chevron-back" size={24} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Glucose Monitor</Text>
        <TouchableOpacity 
          style={styles.deviceButton}
          onPress={handleConnectDevice}
        >
          {connectingDevice ? (
            <ActivityIndicator size="small" color="#5A67D8" />
          ) : (
            <MaterialCommunityIcons name="watch-variant" size={22} color="#5A67D8" />
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Glucose Card */}
        <LinearGradient
          colors={getGradientColors(currentGlucose)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.currentGlucoseCard}
        >
          <View style={styles.glucoseHeaderRow}>
            <Text style={styles.currentGlucoseLabel}>Current Glucose</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{currentStatus.status}</Text>
            </View>
          </View>
          
          <View style={styles.glucoseValueContainer}>
            <Text style={styles.glucoseValue}>{currentGlucose}</Text>
            <Text style={styles.glucoseUnit}>mg/dL</Text>
          </View>
          
          <View style={styles.glucoseStatsRow}>
            <View style={styles.glucoseStat}>
              <Text style={styles.glucoseStatLabel}>AVG</Text>
              <Text style={styles.glucoseStatValue}>{dailyStats.avg}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.glucoseStat}>
              <Text style={styles.glucoseStatLabel}>MIN</Text>
              <Text style={styles.glucoseStatValue}>{dailyStats.min}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.glucoseStat}>
              <Text style={styles.glucoseStatLabel}>MAX</Text>
              <Text style={styles.glucoseStatValue}>{dailyStats.max}</Text>
            </View>
          </View>
          
          <View style={styles.lastUpdatedContainer}>
            <Ionicons name="time-outline" size={14} color="#2D3748" />
            <Text style={styles.lastUpdatedText}>Last updated 4 minutes ago</Text>
          </View>
        </LinearGradient>
        
        {/* Time Range Selector */}
        {renderTimeRangeSelector()}
        
        {/* Glucose Graph */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Glucose Trend</Text>
          {renderGlucoseGraph()}
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#5A67D8' }]} />
              <Text style={styles.legendText}>Glucose</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, { backgroundColor: '#E53E3E' }]} />
              <Text style={styles.legendText}>Threshold</Text>
            </View>
          </View>
        </View>
        
        {/* Insights Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Insights</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color="#5A67D8" style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.insightsContainer}>
              {insights.map((item) => renderInsightCard(item))}
            </View>
          )}
        </View>
        
        {/* Add Meal Button */}
        <TouchableOpacity style={styles.addMealButton}>
          <LinearGradient
            colors={['#5A67D8', '#4C51BF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addMealGradient}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addMealText}>Log New Meal</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    zIndex: 10,
    elevation: 3,
    shadowColor: "#4A5568",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  deviceButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E9EFFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  currentGlucoseCard: {
    margin: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#2D3748",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  glucoseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentGlucoseLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  glucoseValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 10,
    marginBottom: 16,
  },
  glucoseValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  glucoseUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 5,
    marginBottom: 7,
    opacity: 0.9,
  },
  glucoseStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    padding: 12,
  },
  glucoseStat: {
    flex: 1,
    alignItems: 'center',
  },
  glucoseStatLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.9,
  },
  glucoseStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    opacity: 0.9,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#E9EFFB',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 14,
  },
  timeRangeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: "#4A5568",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
  },
  timeRangeTextActive: {
    fontWeight: '700',
    color: '#5A67D8',
  },
  sectionContainer: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  seeAllButton: {
    padding: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A67D8',
  },
  graphContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    shadowColor: "#4A5568",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 6,
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
    height: 220,
  },
  chart: {
    borderRadius: 16,
  },
  referenceLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    height: 1,
    zIndex: 1,
  },
  referenceLabel: {
    position: 'absolute',
    left: 0,
    top: -8,
    fontSize: 10,
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLine: {
    width: 12,
    height: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#4A5568',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#4A5568',
    marginTop: 10,
  },
  insightsContainer: {
    marginBottom: 10,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#4A5568",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  insightCardActive: {
    borderWidth: 1,
    borderColor: '#5A67D880',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  mealIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  insightActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  insightButton: {
    flex: 1,
    backgroundColor: '#5A67D8',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  insightButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5A67D8',
    marginRight: 0,
    marginLeft: 8,
  },
  insightButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  insightButtonTextOutline: {
    color: '#5A67D8',
  },
  addMealButton: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#5A67D8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  addMealGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  addMealText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});