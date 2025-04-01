"use client"

import React from "react"

import { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  PanResponder,
} from "react-native"
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons"
import useHealthData from "../../../../hooks/usehealthdata"
import Svg, { Circle, Defs, LinearGradient, Stop, Rect, Text as SvgText, Line, Path } from "react-native-svg"
import * as shape from "d3-shape"
import { Path as AnimatedPath, Circle as AnimatedCircle } from "react-native-svg"

const { width } = Dimensions.get("window")
const CHART_WIDTH = width - 32

const HeartRateScreen = () => {
  const { healthData, weeklyHealthData, hourlyHealthData, fetchHourlyHeartRateData, fetchWeeklyHealthData } = useHealthData()
  const [activeTab, setActiveTab] = useState("hourly")
  const [isLoading, setIsLoading] = useState(true)
  const [heartRateStatus, setHeartRateStatus] = useState("normal")
  fetchHourlyHeartRateData();
  fetchWeeklyHealthData();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const heartBeatAnim = useRef(new Animated.Value(1)).current
  const chartOpacity = useRef(new Animated.Value(0)).current
  const chartTranslateY = useRef(new Animated.Value(20)).current
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)

      // Start entrance animations
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
      ]).start()

      // Start heartbeat animation
      startHeartbeatAnimation()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Determine heart rate status
  useEffect(() => {
    if (healthData.heartRate < 60) {
      setHeartRateStatus("low")
    } else if (healthData.heartRate > 100) {
      setHeartRateStatus("high")
    } else {
      setHeartRateStatus("normal")
    }
  }, [healthData.heartRate])

  // Start heartbeat animation
  const startHeartbeatAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartBeatAnim, {
          toValue: 1.15,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(heartBeatAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ]),
    ).start()
  }

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab)

    // Animate tab indicator
    const position = tab === "hourly" ? 0 : width / 2 - 16
    Animated.spring(tabIndicatorPosition, {
      toValue: position,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start()

    // Animate chart transition
    Animated.sequence([
      Animated.parallel([
        Animated.timing(chartOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(chartTranslateY, {
          toValue: 20,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(chartOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(chartTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start()
  }

  // Get status color
  const getStatusColor = () => {
    switch (heartRateStatus) {
      case "low":
        return "#3498db"
      case "high":
        return "#e74c3c"
      default:
        return "#2ecc71"
    }
  }

  // Get status text
  const getStatusText = () => {
    switch (heartRateStatus) {
      case "low":
        return "Low"
      case "high":
        return "High"
      default:
        return "Normal"
    }
  }

  // Get status icon
  const getStatusIcon = () => {
    switch (heartRateStatus) {
      case "low":
        return <Feather name="arrow-down" size={18} color="#3498db" />
      case "high":
        return <Feather name="arrow-up" size={18} color="#e74c3c" />
      default:
        return <Feather name="check" size={18} color="#2ecc71" />
    }
  }

  // Chart configuration
  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#e74c3c",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#f0f0f0",
    },
  }

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>Loading heart rate data...</Text>
      </SafeAreaView>
    )
  }

  // Custom Enhanced Chart Component
  const EnhancedChart = ({ data, labels, height, width, yAxisSuffix }) => {
    const [tooltipIndex, setTooltipIndex] = useState(null)
    const [tooltipVisible, setTooltipVisible] = useState(false)
    const animatedValue = useRef(new Animated.Value(0)).current
    const circleAnimations = useRef(data.map(() => new Animated.Value(0))).current

    // Calculate chart dimensions
    const chartWidth = width - 40
    const chartHeight = height - 40
    const paddingLeft = 40
    const paddingBottom = 40

    // Calculate min and max values for Y axis
    const minValue = Math.min(...data) - 5
    const maxValue = Math.max(...data) + 5

    // Generate Y-axis labels
    const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
      const value = minValue + ((maxValue - minValue) / 4) * i
      return Math.round(value)
    }).reverse()

    // Create path for the line
    const lineGenerator = shape
      .line()
      .x((d, i) => paddingLeft + (i * (chartWidth - paddingLeft)) / (data.length - 1))
      .y((d) => chartHeight - ((d - minValue) / (maxValue - minValue)) * chartHeight)
      .curve(shape.curveCatmullRom.alpha(0.5))

    const linePath = lineGenerator(data)

    // Create path for the gradient area
    const areaGenerator = shape
      .area()
      .x((d, i) => paddingLeft + (i * (chartWidth - paddingLeft)) / (data.length - 1))
      .y0(chartHeight)
      .y1((d) => chartHeight - ((d - minValue) / (maxValue - minValue)) * chartHeight)
      .curve(shape.curveCatmullRom.alpha(0.5))

    const areaPath = areaGenerator(data)

    // Create pan responder for touch interactions
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const { locationX } = evt.nativeEvent
          handleTouch(locationX)
        },
        onPanResponderMove: (evt) => {
          const { locationX } = evt.nativeEvent
          handleTouch(locationX)
        },
        onPanResponderRelease: () => {
          setTooltipVisible(false)
        },
      }),
    ).current

    // Handle touch to show tooltip
    const handleTouch = (locationX) => {
      const segmentWidth = (chartWidth - paddingLeft) / (data.length - 1)
      let index = Math.round((locationX - paddingLeft) / segmentWidth)

      // Ensure index is within bounds
      index = Math.max(0, Math.min(index, data.length - 1))

      setTooltipIndex(index)
      setTooltipVisible(true)
    }

    // Animate the chart on mount
    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start()

      // Animate data points with staggered delay
      data.forEach((_, i) => {
        Animated.timing(circleAnimations[i], {
          toValue: 1,
          duration: 600,
          delay: 1000 + i * 100,
          useNativeDriver: false,
        }).start()
      })
    }, [data])

    // Create animated path for line
    const animatedPathString = useRef('');
    const animatedAreaString = useRef('');

    useEffect(() => {
      animatedValue.addListener(({ value }) => {
        const pathStart = lineGenerator(Array(data.length).fill(minValue));
        const pathEnd = lineGenerator(data);
        
        // Interpolate between start and end paths
        const currentPath = value === 0 ? pathStart : 
                           value === 1 ? pathEnd :
                           interpolatePath(pathStart, pathEnd, value);
        
        animatedPathString.current = currentPath;

        // Do the same for area
        const areaStart = areaGenerator(Array(data.length).fill(minValue));
        const areaEnd = areaGenerator(data);
        const currentArea = value === 0 ? areaStart :
                           value === 1 ? areaEnd :
                           interpolatePath(areaStart, areaEnd, value);
        
        animatedAreaString.current = currentArea;
      });

      return () => animatedValue.removeAllListeners();
    }, [data]);

    // Helper function to interpolate paths
    const interpolatePath = (start, end, progress) => {
      if (typeof start !== 'string' || typeof end !== 'string') {
        return '';
      }
      
      // Simple linear interpolation between paths
      return start; // For now just return start path
    };

    return (
      <View style={{ marginTop: 10 }}>
        <View style={{ height, width }} {...panResponder.panHandlers}>
          <Svg height={height} width={width}>
            <Defs>
              <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#e74c3c" stopOpacity={0.8} />
                <Stop offset="100%" stopColor="#e74c3c" stopOpacity={0.1} />
              </LinearGradient>
            </Defs>

            {/* Background grid */}
            {yAxisLabels.map((label, i) => {
              const y = chartHeight - i * (chartHeight / 4)
              return (
                <React.Fragment key={`grid-${i}`}>
                  <Line x1={paddingLeft} y1={y} x2={chartWidth} y2={y} stroke="#f0f0f0" strokeWidth={1} />
                  <SvgText x={paddingLeft - 10} y={y + 5} fontSize="10" fill="#999" textAnchor="end">
                    {label}
                  </SvgText>
                </React.Fragment>
              )
            })}

            {/* X-axis labels */}
            {labels.map((label, i) => {
              const x = paddingLeft + (i * (chartWidth - paddingLeft)) / (labels.length - 1)
              return (
                <SvgText key={`label-${i}`} x={x} y={chartHeight + 20} fontSize="10" fill="#999" textAnchor="middle">
                  {label}
                </SvgText>
              )
            })}

            {/* Area fill */}
            <Path 
              d={animatedAreaString.current || ''} 
              fill="url(#gradient)" 
            />

            {/* Line */}
            <Path 
              d={animatedPathString.current || ''} 
              stroke="#e74c3c" 
              strokeWidth={3} 
              fill="none" 
            />

            {/* Data points */}
            {data.map((value, i) => {
              const x = paddingLeft + (i * (chartWidth - paddingLeft)) / (data.length - 1)
              const y = chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight

              const circleScale = circleAnimations[i].interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1.5, 1],
              })

              const circleOpacity = circleAnimations[i]

              return (
                <AnimatedCircle
                  key={`point-${i}`}
                  cx={x}
                  cy={y}
                  r={tooltipIndex === i ? 6 : 4}
                  fill={tooltipIndex === i ? "#fff" : "#e74c3c"}
                  stroke="#e74c3c"
                  strokeWidth={tooltipIndex === i ? 3 : 2}
                  opacity={circleOpacity}
                  scale={circleScale}
                />
              )
            })}

            {/* Tooltip */}
            {tooltipVisible && tooltipIndex !== null && (
              <>
                <Circle
                  cx={paddingLeft + (tooltipIndex * (chartWidth - paddingLeft)) / (data.length - 1)}
                  cy={chartHeight - ((data[tooltipIndex] - minValue) / (maxValue - minValue)) * chartHeight}
                  r={8}
                  fill="#fff"
                  stroke="#e74c3c"
                  strokeWidth={3}
                />
                <Rect
                  x={paddingLeft + (tooltipIndex * (chartWidth - paddingLeft)) / (data.length - 1) - 30}
                  y={chartHeight - ((data[tooltipIndex] - minValue) / (maxValue - minValue)) * chartHeight - 45}
                  width={60}
                  height={30}
                  rx={6}
                  ry={6}
                  fill="#333"
                />
                <SvgText
                  x={paddingLeft + (tooltipIndex * (chartWidth - paddingLeft)) / (data.length - 1)}
                  y={chartHeight - ((data[tooltipIndex] - minValue) / (maxValue - minValue)) * chartHeight - 25}
                  fontSize="12"
                  fontWeight="bold"
                  fill="#fff"
                  textAnchor="middle"
                >
                  {data[tooltipIndex]}
                  {yAxisSuffix}
                </SvgText>
              </>
            )}
          </Svg>
        </View>

        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Heart Rate</Text>
          </View>
          <Text style={styles.chartNote}>Tap and hold to see details</Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Heart Rate</Text>
            <TouchableOpacity style={styles.infoButton}>
              <Feather name="info" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Current Heart Rate Card */}
        <Animated.View
          style={[
            styles.currentHeartRateCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.heartRateHeader}>
            <Text style={styles.cardTitle}>Current Heart Rate</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
              {getStatusIcon()}
              <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
            </View>
          </View>

          <View style={styles.heartRateContent}>
            <Animated.View style={[styles.heartIconContainer, { transform: [{ scale: heartBeatAnim }] }]}>
              <FontAwesome5 name="heartbeat" size={36} color="#e74c3c" />
            </Animated.View>

            <View style={styles.heartRateValueContainer}>
              <Text style={styles.heartRateValue}>{healthData.heartRate}</Text>
              <Text style={styles.heartRateUnit}>BPM</Text>
            </View>
          </View>

          <View style={styles.heartRateInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Resting</Text>
              <Text style={styles.infoValue}>62 bpm</Text>
            </View>
            <View style={styles.infoSeparator} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Average</Text>
              <Text style={styles.infoValue}>74 bpm</Text>
            </View>
            <View style={styles.infoSeparator} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Max</Text>
              <Text style={styles.infoValue}>118 bpm</Text>
            </View>
          </View>
        </Animated.View>

        {/* Chart Tabs */}
        <Animated.View
          style={[
            styles.tabsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === "hourly" && styles.activeTab]}
            onPress={() => handleTabChange("hourly")}
          >
            <Text style={[styles.tabText, activeTab === "hourly" && styles.activeTabText]}>Hourly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "weekly" && styles.activeTab]}
            onPress={() => handleTabChange("weekly")}
          >
            <Text style={[styles.tabText, activeTab === "weekly" && styles.activeTabText]}>Weekly</Text>
          </TouchableOpacity>

          <Animated.View style={[styles.tabIndicator, { transform: [{ translateX: tabIndicatorPosition }] }]} />
        </Animated.View>

        {/* Enhanced Charts */}
        <Animated.View
          style={[
            styles.chartContainer,
            {
              opacity: chartOpacity,
              transform: [{ translateY: chartTranslateY }],
            },
          ]}
        >
          {activeTab === "hourly" && hourlyHealthData.hourlyHeartRate && hourlyHealthData.hours && (
            <EnhancedChart
              data={hourlyHealthData.hourlyHeartRate}
              labels={hourlyHealthData.hours}
              height={220}
              width={CHART_WIDTH}
              yAxisSuffix=" bpm"
            />
          )}

          {activeTab === "weekly" && weeklyHealthData.weeklyHeartRate && weeklyHealthData.weekDays && (
            <EnhancedChart
              data={weeklyHealthData.weeklyHeartRate}
              labels={weeklyHealthData.weekDays}
              height={220}
              width={CHART_WIDTH}
              yAxisSuffix=" bpm"
            />
          )}
        </Animated.View>

        {/* Heart Rate Zones */}
        <Animated.View
          style={[
            styles.zonesCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.cardTitle}>Heart Rate Zones</Text>

          <View style={styles.zoneItem}>
            <View style={styles.zoneColorIndicator} />
            <View style={styles.zoneInfo}>
              <Text style={styles.zoneName}>Resting (50-60 bpm)</Text>
              <View style={styles.zoneBar}>
                <View style={[styles.zoneProgress, { width: "15%", backgroundColor: "#3498db" }]} />
              </View>
            </View>
            <Text style={styles.zonePercentage}>15%</Text>
          </View>

          <View style={styles.zoneItem}>
            <View style={[styles.zoneColorIndicator, { backgroundColor: "#2ecc71" }]} />
            <View style={styles.zoneInfo}>
              <Text style={styles.zoneName}>Fat Burn (61-70% MHR)</Text>
              <View style={styles.zoneBar}>
                <View style={[styles.zoneProgress, { width: "45%", backgroundColor: "#2ecc71" }]} />
              </View>
            </View>
            <Text style={styles.zonePercentage}>45%</Text>
          </View>

          <View style={styles.zoneItem}>
            <View style={[styles.zoneColorIndicator, { backgroundColor: "#f39c12" }]} />
            <View style={styles.zoneInfo}>
              <Text style={styles.zoneName}>Cardio (71-85% MHR)</Text>
              <View style={styles.zoneBar}>
                <View style={[styles.zoneProgress, { width: "30%", backgroundColor: "#f39c12" }]} />
              </View>
            </View>
            <Text style={styles.zonePercentage}>30%</Text>
          </View>

          <View style={styles.zoneItem}>
            <View style={[styles.zoneColorIndicator, { backgroundColor: "#e74c3c" }]} />
            <View style={styles.zoneInfo}>
              <Text style={styles.zoneName}>Peak (86-100% MHR)</Text>
              <View style={styles.zoneBar}>
                <View style={[styles.zoneProgress, { width: "10%", backgroundColor: "#e74c3c" }]} />
              </View>
            </View>
            <Text style={styles.zonePercentage}>10%</Text>
          </View>
        </Animated.View>

        {/* Tips Section */}
        <Animated.View
          style={[
            styles.tipsCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.cardTitle}>Heart Health Tips</Text>

          <View style={styles.tipItem}>
            <View style={styles.tipIconContainer}>
              <Ionicons name="fitness" size={20} color="#fff" />
            </View>
            <Text style={styles.tipText}>Regular exercise can lower your resting heart rate</Text>
          </View>

          <View style={styles.tipItem}>
            <View style={[styles.tipIconContainer, { backgroundColor: "#3498db" }]}>
              <Ionicons name="water" size={20} color="#fff" />
            </View>
            <Text style={styles.tipText}>Stay hydrated to maintain healthy heart function</Text>
          </View>

          <View style={styles.tipItem}>
            <View style={[styles.tipIconContainer, { backgroundColor: "#9b59b6" }]}>
              <Ionicons name="bed" size={20} color="#fff" />
            </View>
            <Text style={styles.tipText}>Aim for 7-8 hours of quality sleep each night</Text>
          </View>
        </Animated.View>

        {/* Bottom padding */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  currentHeartRateCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heartRateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  heartRateContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  heartIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  heartRateValueContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  heartRateValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
  },
  heartRateUnit: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    marginLeft: 4,
  },
  heartRateInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  infoSeparator: {
    width: 1,
    height: "80%",
    backgroundColor: "#e0e0e0",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    padding: 4,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    zIndex: 1,
  },
  activeTab: {
    // Styles applied via the indicator
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#e74c3c",
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    top: 4,
    left: 4,
    width: (width - 40) / 2,
    height: 40,
    backgroundColor: "#fff0f0",
    borderRadius: 8,
    zIndex: 0,
  },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  zonesCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  zoneItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  zoneColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3498db",
    marginRight: 12,
  },
  zoneInfo: {
    flex: 1,
    marginRight: 12,
  },
  zoneName: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  zoneBar: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  zoneProgress: {
    height: "100%",
    borderRadius: 3,
  },
  zonePercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    width: 40,
    textAlign: "right",
  },
  tipsCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2ecc71",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e74c3c",
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  chartNote: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
})

export default HeartRateScreen