"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  SafeAreaView,
  Platform,
  RefreshControl,
} from "react-native"
import { BlurView } from "expo-blur"
import { useClientUserContext } from "../context/ClientUserContext"
import axios from "axios"
import { URL } from "../../constants/url"
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")

const FoodReportScreen = () => {
  const { clientUser } = useClientUserContext()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [report, setReport] = useState(null)
  const [timeRange, setTimeRange] = useState("week") // 'week' or 'month'
  const [permissions, setPermissions] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const headerHeight = useRef(new Animated.Value(Platform.OS === "ios" ? 100 : 80)).current
  const scrollY = useRef(new Animated.Value(0)).current

  // Add permission fetch
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await axios.get(`${URL}/api/clientdata/${clientUser.clientId}`)
        setPermissions(response.data.client.permissions)
      } catch (error) {
        console.error("Error fetching permissions:", error)
      }
    }

    fetchPermissions()
  }, [clientUser.clientId])

  useEffect(() => {
    fetchReport()
  }, [timeRange])

  // Start entrance animations when data is loaded
  useEffect(() => {
    if (!loading && report) {
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
    }
  }, [loading, report])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const endDate = new Date()
      const startDate = new Date()

      if (timeRange === "week") {
        startDate.setDate(startDate.getDate() - 7)
      } else {
        startDate.setMonth(startDate.getMonth() - 1)
      }

      const response = await axios.get(`${URL}/api/clientdata/report/${clientUser.clientId}`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      })

      setReport(response.data)

      // Set the most recent day as selected by default
      if (response.data?.dailyTotals) {
        const sortedDates = Object.keys(response.data.dailyTotals).sort((a, b) => new Date(b) - new Date(a))

        if (sortedDates.length > 0) {
          setSelectedDay(sortedDates[0])
        }
      }
    } catch (error) {
      console.error("Error fetching report:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchReport()
  }

  // Header animation based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  // Get color based on nutrient type
  const getNutrientColor = (type) => {
    switch (type.toLowerCase()) {
      case "calories":
        return "#FF6B6B"
      case "protein":
        return "#4D96FF"
      case "carbs":
        return "#6BCB77"
      case "fats":
        return "#FFD93D"
      default:
        return "#6C757D"
    }
  }

  // Calculate progress percentage for macros
  const calculateProgress = (value, target) => {
    if (!target || target === 0) return 0
    const percentage = (value / target) * 100
    return Math.min(percentage, 100) // Cap at 100%
  }

  // Get target values (these would ideally come from the API)
  const getTargetValue = (type) => {
    // Sample targets - in a real app, these would come from the user's profile
    const targets = {
      calories: 2000,
      protein: 120,
      carbs: 250,
      fats: 65,
    }
    return targets[type.toLowerCase()] || 0
  }

  const renderProgressBar = (value, type) => {
    const target = getTargetValue(type)
    const percentage = calculateProgress(value, target)
    const color = getNutrientColor(type)

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarLabels}>
          <Text style={styles.progressBarValue}>{Math.round(value)}</Text>
          <Text style={styles.progressBarTarget}>of {target}</Text>
        </View>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: `${percentage}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      </View>
    )
  }

  const renderAverages = () => {
    if (!report?.averages) return null

    return (
      <Animated.View
        style={[
          styles.averagesCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Daily Averages</Text>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>{timeRange === "week" ? "7 days" : "30 days"}</Text>
          </View>
        </View>

        <View style={styles.nutrientItem}>
          <View style={styles.nutrientHeader}>
            <View style={styles.nutrientLabelContainer}>
              <View style={[styles.nutrientIcon, { backgroundColor: getNutrientColor("calories") + "20" }]}>
                <FontAwesome5 name="fire" size={14} color={getNutrientColor("calories")} />
              </View>
              <Text style={styles.nutrientLabel}>Calories</Text>
            </View>
            <Text style={[styles.nutrientValue, { color: getNutrientColor("calories") }]}>
              {Math.round(report.averages.calories)}
            </Text>
          </View>
          {renderProgressBar(report.averages.calories, "calories")}
        </View>

        <View style={styles.nutrientItem}>
          <View style={styles.nutrientHeader}>
            <View style={styles.nutrientLabelContainer}>
              <View style={[styles.nutrientIcon, { backgroundColor: getNutrientColor("protein") + "20" }]}>
                <MaterialCommunityIcons name="food-steak" size={14} color={getNutrientColor("protein")} />
              </View>
              <Text style={styles.nutrientLabel}>Protein</Text>
            </View>
            <Text style={[styles.nutrientValue, { color: getNutrientColor("protein") }]}>
              {Math.round(report.averages.protein)}g
            </Text>
          </View>
          {renderProgressBar(report.averages.protein, "protein")}
        </View>

        <View style={styles.nutrientItem}>
          <View style={styles.nutrientHeader}>
            <View style={styles.nutrientLabelContainer}>
              <View style={[styles.nutrientIcon, { backgroundColor: getNutrientColor("carbs") + "20" }]}>
                <MaterialCommunityIcons name="bread-slice" size={14} color={getNutrientColor("carbs")} />
              </View>
              <Text style={styles.nutrientLabel}>Carbs</Text>
            </View>
            <Text style={[styles.nutrientValue, { color: getNutrientColor("carbs") }]}>
              {Math.round(report.averages.carbs)}g
            </Text>
          </View>
          {renderProgressBar(report.averages.carbs, "carbs")}
        </View>

        <View style={styles.nutrientItem}>
          <View style={styles.nutrientHeader}>
            <View style={styles.nutrientLabelContainer}>
              <View style={[styles.nutrientIcon, { backgroundColor: getNutrientColor("fats") + "20" }]}>
                <MaterialCommunityIcons name="oil" size={14} color={getNutrientColor("fats")} />
              </View>
              <Text style={styles.nutrientLabel}>Fats</Text>
            </View>
            <Text style={[styles.nutrientValue, { color: getNutrientColor("fats") }]}>
              {Math.round(report.averages.fats)}g
            </Text>
          </View>
          {renderProgressBar(report.averages.fats, "fats")}
        </View>
      </Animated.View>
    )
  }

  const renderDaySelector = () => {
    if (!report?.dailyTotals) return null

    const sortedDates = Object.keys(report.dailyTotals).sort((a, b) => new Date(b) - new Date(a))

    return (
      <Animated.View
        style={[
          styles.daySelectorContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Daily Breakdown</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelector}>
          {sortedDates.map((date) => (
            <TouchableOpacity
              key={date}
              style={[styles.dayButton, selectedDay === date && styles.selectedDayButton]}
              onPress={() => setSelectedDay(date)}
            >
              <Text style={[styles.dayButtonText, selectedDay === date && styles.selectedDayButtonText]}>
                {formatDate(date)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    )
  }

  const renderSelectedDayDetails = () => {
    if (!selectedDay || !report?.dailyTotals || !report.dailyTotals[selectedDay]) return null

    const dayData = report.dailyTotals[selectedDay]

    return (
      <Animated.View
        style={[
          styles.dayDetailsCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.dayDetailsSummary}>
          <View style={styles.dayDetailsMacro}>
            <FontAwesome5 name="fire" size={16} color={getNutrientColor("calories")} />
            <Text style={styles.dayDetailsMacroValue}>{Math.round(dayData.calories)}</Text>
            <Text style={styles.dayDetailsMacroLabel}>calories</Text>
          </View>

          <View style={styles.dayDetailsDivider} />

          <View style={styles.dayDetailsMacro}>
            <MaterialCommunityIcons name="food-steak" size={16} color={getNutrientColor("protein")} />
            <Text style={styles.dayDetailsMacroValue}>{Math.round(dayData.protein)}g</Text>
            <Text style={styles.dayDetailsMacroLabel}>protein</Text>
          </View>

          <View style={styles.dayDetailsDivider} />

          <View style={styles.dayDetailsMacro}>
            <MaterialCommunityIcons name="bread-slice" size={16} color={getNutrientColor("carbs")} />
            <Text style={styles.dayDetailsMacroValue}>{Math.round(dayData.carbs)}g</Text>
            <Text style={styles.dayDetailsMacroLabel}>carbs</Text>
          </View>

          <View style={styles.dayDetailsDivider} />

          <View style={styles.dayDetailsMacro}>
            <MaterialCommunityIcons name="oil" size={16} color={getNutrientColor("fats")} />
            <Text style={styles.dayDetailsMacroValue}>{Math.round(dayData.fats)}g</Text>
            <Text style={styles.dayDetailsMacroLabel}>fats</Text>
          </View>
        </View>

        <View style={styles.mealsHeader}>
          <Text style={styles.mealsTitle}>Meals</Text>
          <Text style={styles.mealsCount}>{dayData.meals.length} items</Text>
        </View>

        <View style={styles.mealsContainer}>
          {dayData.meals.map((meal, index) => {
            // Get meal type color
            const getMealTypeColor = () => {
              switch (meal.mealType.toLowerCase()) {
                case "breakfast":
                  return "#FF9800"
                case "lunch":
                  return "#4CAF50"
                case "dinner":
                  return "#3F51B5"
                case "snack":
                  return "#E91E63"
                default:
                  return "#607D8B"
              }
            }

            return (
              <View key={index} style={styles.mealItem}>
                <View style={styles.mealItemLeft}>
                  <View style={[styles.mealTypeTag, { backgroundColor: getMealTypeColor() + "20" }]}>
                    <Text style={[styles.mealTypeText, { color: getMealTypeColor() }]}>{meal.mealType}</Text>
                  </View>
                  <Text style={styles.mealName}>{meal.foodName}</Text>
                </View>

                <View style={styles.mealItemRight}>
                  <Text style={styles.mealCalories}>{Math.round(meal.calories)} cal</Text>
                  {meal.protein && <Text style={styles.mealProtein}>{Math.round(meal.protein)}g protein</Text>}
                </View>
              </View>
            )
          })}
        </View>
      </Animated.View>
    )
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#3E6B89" />
        <Text style={styles.loadingText}>Loading your nutrition report...</Text>
      </SafeAreaView>
    )
  }

  // Add permission check
  if (!permissions?.viewReports) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <BlurView intensity={95} style={StyleSheet.absoluteFill}>
          <View style={styles.noPermissionContainer}>
            <View style={styles.lockIconContainer}>
              <Ionicons name="lock-closed" size={48} color="#fff" />
            </View>
            <Text style={styles.noPermissionText}>You don't have permission to view reports</Text>
            <Text style={styles.noPermissionSubText}>Please contact your nutritionist for access</Text>
          </View>
        </BlurView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Animated Header Background */}
      <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={90} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "#FFFFFF" }]} />
        )}
      </Animated.View>

      {/* Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Nutrition Report</Text>
          <Text style={styles.headerSubtitle}>Track your daily nutrition intake</Text>
        </View>

        <View style={styles.timeRangeButtons}>
          <TouchableOpacity
            style={[styles.timeButton, timeRange === "week" && styles.activeTimeButton]}
            onPress={() => setTimeRange("week")}
          >
            <Text style={[styles.timeButtonText, timeRange === "week" && styles.activeTimeButtonText]}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeButton, timeRange === "month" && styles.activeTimeButton]}
            onPress={() => setTimeRange("month")}
          >
            <Text style={[styles.timeButtonText, timeRange === "month" && styles.activeTimeButtonText]}>Month</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3E6B89"]} tintColor="#3E6B89" />
        }
      >
        {renderAverages()}
        {renderDaySelector()}
        {renderSelectedDayDetails()}

        {/* Empty state if no data */}
        {(!report || Object.keys(report.dailyTotals || {}).length === 0) && (
          <Animated.View
            style={[
              styles.emptyStateContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <MaterialCommunityIcons name="food-off" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Data Available</Text>
            <Text style={styles.emptyStateMessage}>
              There is no nutrition data available for the selected time period.
            </Text>
          </Animated.View>
        )}

        {/* Bottom padding */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 140 : 120,
    zIndex: 1,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 0 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
    zIndex: 2,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E3A59",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#8896AB",
  },
  timeRangeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  activeTimeButton: {
    backgroundColor: "#3E6B89",
  },
  timeButtonText: {
    color: "#8896AB",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTimeButtonText: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E3A59",
  },
  cardBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardBadgeText: {
    fontSize: 12,
    color: "#8896AB",
    fontWeight: "500",
  },
  averagesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  nutrientItem: {
    marginBottom: 16,
  },
  nutrientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  nutrientLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  nutrientIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  nutrientLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E3A59",
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBarLabels: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 4,
  },
  progressBarValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E3A59",
  },
  progressBarTarget: {
    fontSize: 12,
    color: "#8896AB",
    marginLeft: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  daySelectorContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E3A59",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  daySelector: {
    paddingBottom: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
  },
  selectedDayButton: {
    backgroundColor: "#3E6B89",
  },
  dayButtonText: {
    fontSize: 14,
    color: "#8896AB",
    fontWeight: "500",
  },
  selectedDayButtonText: {
    color: "#FFFFFF",
  },
  dayDetailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    paddingTop: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dayDetailsSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  dayDetailsMacro: {
    alignItems: "center",
  },
  dayDetailsMacroValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E3A59",
    marginTop: 4,
    marginBottom: 2,
  },
  dayDetailsMacroLabel: {
    fontSize: 12,
    color: "#8896AB",
  },
  dayDetailsDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#E5E9F0",
    alignSelf: "center",
  },
  mealsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  mealsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E3A59",
  },
  mealsCount: {
    fontSize: 14,
    color: "#8896AB",
  },
  mealsContainer: {
    gap: 12,
  },
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  mealItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  mealTypeTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  mealTypeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  mealName: {
    fontSize: 15,
    color: "#2E3A59",
    fontWeight: "500",
  },
  mealItemRight: {
    alignItems: "flex-end",
  },
  mealCalories: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF6B6B",
    marginBottom: 2,
  },
  mealProtein: {
    fontSize: 12,
    color: "#4D96FF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8896AB",
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3E6B89",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noPermissionText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2E3A59",
    textAlign: "center",
    marginBottom: 12,
  },
  noPermissionSubText: {
    fontSize: 16,
    color: "#8896AB",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E3A59",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: "#8896AB",
    textAlign: "center",
    lineHeight: 20,
  },
})

export default FoodReportScreen

