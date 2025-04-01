import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
} from "react-native"
import { PieChart } from "react-native-chart-kit"
import { BarChart } from "react-native-chart-kit"
import { format, subDays } from "date-fns"
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"
import fetchNutritionData from "./api/fetchNutritionData"
import { LinearGradient } from "expo-linear-gradient"
import {useuserDetailContext, useUserDetailContext} from '../../../context/UserDetailContext'

const { width } = Dimensions.get("window")

const NutritionDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const {userDetail} = useuserDetailContext()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetchNutritionData(userDetail.userId)
      if (response.success) {
        setData(response.data)
      } else {
        console.error("Failed to fetch nutrition data")
      }
    } catch (error) {
      console.error("Error fetching nutrition data:", error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const formattedDate = format(selectedDate, "yyyy-MM-dd")
  const dailyData = data?.dailyMetrics[formattedDate]

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading nutrition data...</Text>
      </View>
    )
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={60} color="#FF5252" />
        <Text style={styles.errorText}>Failed to load nutrition data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const { summary, goals, trends, userMetrics } = data

  // Prepare data for pie chart
  const macroData = [
    {
      name: "Protein",
      population: summary.averageProtein,
      color: "#5E60CE",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Carbs",
      population: summary.averageCarbs,
      color: "#64DFDF",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Fats",
      population: summary.averageFats,
      color: "#FF9F1C",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
  ]

  // Prepare data for bar chart
  const today = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i)
    return format(date, "yyyy-MM-dd")
  })

  const labels = last7Days.map((date) => format(new Date(date), "MM/dd"))
  const caloriesData = last7Days.map((date) => (data.dailyMetrics[date] ? data.dailyMetrics[date].calories : 0))

  const barData = {
    labels: labels,
    datasets: [
      {
        data: caloriesData,
        colors: [
          (opacity = 1) => `rgba(94, 129, 244, ${opacity})`,
          (opacity = 1) => `rgba(94, 129, 244, ${opacity})`,
          (opacity = 1) => `rgba(94, 129, 244, ${opacity})`,
          (opacity = 1) => `rgba(94, 129, 244, ${opacity})`,
          (opacity = 1) => `rgba(94, 129, 244, ${opacity})`,
          (opacity = 1) => `rgba(94, 129, 244, ${opacity})`,
          (opacity = 1) => `rgba(94, 129, 244, ${opacity})`,
        ],
      },
    ],
  }

  const chartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  }

  const renderTrendIndicator = (trend) => {
    if (trend > 0) {
      return <Ionicons name="arrow-up" size={16} color="#4CAF50" />
    } else if (trend < 0) {
      return <Ionicons name="arrow-down" size={16} color="#FF5252" />
    }
    return null
  }

  const renderProgressBar = (current, goal) => {
    const percentage = Math.min((current / goal) * 100, 100)
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${percentage}%` }]} />
      </View>
    )
  }

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Summary Cards */}
      <View style={styles.summaryCardsContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Calories</Text>
          <View style={styles.summaryCardContent}>
            <Text style={styles.summaryCardValue}>{summary.averageCalories}</Text>
            <View style={styles.trendContainer}>{renderTrendIndicator(trends.caloriesTrend)}</View>
          </View>
          {renderProgressBar(goals.progress.calories.current, goals.progress.calories.goal)}
          <Text style={styles.progressText}>{goals.progress.calories.percentage}% of goal</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Protein</Text>
          <View style={styles.summaryCardContent}>
            <Text style={styles.summaryCardValue}>{summary.averageProtein}g</Text>
            <View style={styles.trendContainer}>{renderTrendIndicator(trends.proteinTrend)}</View>
          </View>
          {renderProgressBar(goals.progress.protein.current, goals.progress.protein.goal)}
          <Text style={styles.progressText}>{goals.progress.protein.percentage}% of goal</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Carbs</Text>
          <View style={styles.summaryCardContent}>
            <Text style={styles.summaryCardValue}>{summary.averageCarbs}g</Text>
            <View style={styles.trendContainer}>{renderTrendIndicator(trends.carbsTrend)}</View>
          </View>
          {renderProgressBar(goals.progress.carbs.current, goals.progress.carbs.goal)}
          <Text style={styles.progressText}>{goals.progress.carbs.percentage}% of goal</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Fats</Text>
          <View style={styles.summaryCardContent}>
            <Text style={styles.summaryCardValue}>{summary.averageFats}g</Text>
            <View style={styles.trendContainer}>{renderTrendIndicator(trends.fatsTrend)}</View>
          </View>
          {renderProgressBar(goals.progress.fats.current, goals.progress.fats.goal)}
          <Text style={styles.progressText}>{goals.progress.fats.percentage}% of goal</Text>
        </View>
      </View>

      {/* Macronutrient Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Macronutrient Breakdown</Text>
        <View style={styles.chartContainer}>
          <PieChart
            data={macroData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute={false}
            hasLegend={true}
            center={[10, 0]}
          />
        </View>
      </View>

      {/* Goal Progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Goal Progress</Text>

        <View style={styles.goalItem}>
          <View style={styles.goalHeader}>
            <View style={styles.goalLabelContainer}>
              <MaterialCommunityIcons name="lightning-bolt" size={16} color="#FF9F1C" />
              <Text style={styles.goalLabel}>Calories</Text>
            </View>
            <Text style={styles.goalValues}>
              {goals.progress.calories.current} / {goals.progress.calories.goal}
            </Text>
          </View>
          {renderProgressBar(goals.progress.calories.current, goals.progress.calories.goal)}
        </View>

        <View style={styles.goalItem}>
          <View style={styles.goalHeader}>
            <View style={styles.goalLabelContainer}>
              <MaterialCommunityIcons name="food-steak" size={16} color="#5E60CE" />
              <Text style={styles.goalLabel}>Protein</Text>
            </View>
            <Text style={styles.goalValues}>
              {goals.progress.protein.current}g / {goals.progress.protein.goal}g
            </Text>
          </View>
          {renderProgressBar(goals.progress.protein.current, goals.progress.protein.goal)}
        </View>

        <View style={styles.goalItem}>
          <View style={styles.goalHeader}>
            <View style={styles.goalLabelContainer}>
              <MaterialCommunityIcons name="bread-slice" size={16} color="#64DFDF" />
              <Text style={styles.goalLabel}>Carbs</Text>
            </View>
            <Text style={styles.goalValues}>
              {goals.progress.carbs.current}g / {goals.progress.carbs.goal}g
            </Text>
          </View>
          {renderProgressBar(goals.progress.carbs.current, goals.progress.carbs.goal)}
        </View>

        <View style={styles.goalItem}>
          <View style={styles.goalHeader}>
            <View style={styles.goalLabelContainer}>
              <MaterialCommunityIcons name="oil" size={16} color="#FF9F1C" />
              <Text style={styles.goalLabel}>Fats</Text>
            </View>
            <Text style={styles.goalValues}>
              {goals.progress.fats.current}g / {goals.progress.fats.goal}g
            </Text>
          </View>
          {renderProgressBar(goals.progress.fats.current, goals.progress.fats.goal)}
        </View>
      </View>

      {/* User Metrics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>User Metrics</Text>

        <View style={styles.metricItem}>
          <View style={styles.metricLabelContainer}>
            <FontAwesome5 name="weight" size={14} color="#666" />
            <Text style={styles.metricLabel}>Current Weight</Text>
          </View>
          <Text style={styles.metricValue}>{userMetrics.weight} kg</Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricLabelContainer}>
            <MaterialCommunityIcons name="target" size={16} color="#666" />
            <Text style={styles.metricLabel}>Goal Weight</Text>
          </View>
          <Text style={styles.metricValue}>{userMetrics.goalWeight ? `${userMetrics.goalWeight} kg` : "Not set"}</Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricLabelContainer}>
            <FontAwesome5 name="heartbeat" size={14} color="#666" />
            <Text style={styles.metricLabel}>BMI</Text>
          </View>
          <Text style={styles.metricValue}>{userMetrics.bmi}</Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricLabelContainer}>
            <MaterialCommunityIcons name="run" size={16} color="#666" />
            <Text style={styles.metricLabel}>Activity Level</Text>
          </View>
          <Text style={styles.metricValue}>{userMetrics.activityLevel}</Text>
        </View>
      </View>

      {/* Calorie Trends */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calorie Trends</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={barData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            fromZero={true}
            showBarTops={true}
            showValuesOnTopOfBars={true}
            withInnerLines={true}
            style={styles.barChart}
          />
        </View>
      </View>
    </View>
  )

  const renderDailyTab = () => (
    <View style={styles.tabContent}>
      {dailyData ? (
        <>
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>{format(selectedDate, "MMMM d, yyyy")}</Text>
            <View style={styles.mealBadge}>
              <MaterialCommunityIcons name="food-fork-drink" size={14} color="#FFF" />
              <Text style={styles.mealBadgeText}>{dailyData.meals.length} meals</Text>
            </View>
          </View>

          {/* Daily Macros */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Daily Macros</Text>

            <View style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalLabel}>Calories</Text>
                <Text style={styles.goalValues}>
                  {dailyData.calories} / {goals.progress.calories.goal}
                </Text>
              </View>
              {renderProgressBar(dailyData.calories, goals.progress.calories.goal)}
            </View>

            <View style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalLabel}>Protein</Text>
                <Text style={styles.goalValues}>
                  {dailyData.protein}g / {goals.progress.protein.goal}g
                </Text>
              </View>
              {renderProgressBar(dailyData.protein, goals.progress.protein.goal)}
            </View>

            <View style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalLabel}>Carbs</Text>
                <Text style={styles.goalValues}>
                  {dailyData.carbs}g / {goals.progress.carbs.goal}g
                </Text>
              </View>
              {renderProgressBar(dailyData.carbs, goals.progress.carbs.goal)}
            </View>

            <View style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalLabel}>Fats</Text>
                <Text style={styles.goalValues}>
                  {dailyData.fats}g / {goals.progress.fats.goal}g
                </Text>
              </View>
              {renderProgressBar(dailyData.fats, goals.progress.fats.goal)}
            </View>

            <View style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalLabel}>Fiber</Text>
                <Text style={styles.goalValues}>{dailyData.fiber}g</Text>
              </View>
              {renderProgressBar(dailyData.fiber, 25)} {/* Assuming 25g is the daily recommended fiber */}
            </View>
          </View>

          {/* Meals */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Meals</Text>

            {dailyData.meals.length > 0 ? (
              <View style={styles.mealsList}>
                {dailyData.meals.map((meal, index) => (
                  <View key={index} style={styles.mealItem}>
                    <View style={styles.mealNumberBadge}>
                      <Text style={styles.mealNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.mealName}>{meal}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyStateText}>No meals logged for this day.</Text>
            )}
          </View>

          {/* Micronutrients */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Micronutrients</Text>

            <View style={styles.nutrientGrid}>
              {Object.entries(dailyData.nutrients).map(([key, value], index) => (
                <View key={index} style={styles.nutrientItem}>
                  <Text style={styles.nutrientLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                  </Text>
                  <Text style={styles.nutrientValue}>
                    {value} {getNutrientUnit(key)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="calendar-outline" size={60} color="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>No Data Available</Text>
          <Text style={styles.emptyStateText}>
            There is no nutrition data available for {format(selectedDate, "MMMM d, yyyy")}.
          </Text>
        </View>
      )}
    </View>
  )

  const renderInsightsTab = () => (
    <View style={styles.tabContent}>
      {/* Insights */}
      <View style={styles.insightsContainer}>
        {goals.insights.map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              {getInsightIcon(insight.type)}
              <Text style={styles.insightTitle}>{getInsightTitle(insight.type)}</Text>
            </View>
            <Text style={styles.insightMessage}>{insight.message}</Text>
          </View>
        ))}
      </View>

      {/* Current Goals */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Goals</Text>

        <View style={styles.goalsList}>
          {goals.current.map((goal, index) => (
            <View key={index} style={styles.goalBadge}>
              <Text style={styles.goalBadgeText}>{goal}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Best Performance */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Best Performance</Text>

        <View style={styles.bestDayContainer}>
          <View style={styles.bestDayInfo}>
            <Text style={styles.bestDayLabel}>Best Day</Text>
            <Text style={styles.bestDayDate}>{format(new Date(summary.bestDay.date), "MMMM d, yyyy")}</Text>
          </View>
          <Text style={styles.bestDayScore}>{(summary.bestDay.score * 100).toFixed(1)}%</Text>
        </View>

        {renderProgressBar(summary.bestDay.score * 100, 100)}
      </View>
    </View>
  )

  const getInsightIcon = (type) => {
    switch (type) {
      case "calories":
        return <MaterialCommunityIcons name="lightning-bolt" size={20} color="#FF9F1C" />
      case "protein":
        return <MaterialCommunityIcons name="food-steak" size={20} color="#5E60CE" />
      case "carbs":
        return <MaterialCommunityIcons name="bread-slice" size={20} color="#64DFDF" />
      default:
        return <Ionicons name="information-circle" size={20} color="#4CAF50" />
    }
  }

  const getInsightTitle = (type) => {
    switch (type) {
      case "calories":
        return "Calorie Insight"
      case "protein":
        return "Protein Insight"
      case "carbs":
        return "Carbohydrate Insight"
      default:
        return "Nutrition Insight"
    }
  }

  const getNutrientUnit = (nutrient) => {
    const units = {
      sugar: "g",
      cholesterol: "mg",
      iron: "mg",
      magnesium: "mg",
      potassium: "mg",
      sodium: "mg",
      zinc: "mg",
      vitaminB12: "μg",
      vitaminB6: "mg",
      vitaminC: "mg",
      vitaminD: "μg",
    }

    return units[nutrient] || ""
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#4CAF50", "#2E7D32"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <Text style={styles.headerTitle}>Nutrition Dashboard</Text>
        <Text style={styles.headerSubtitle}>Track your nutrition goals and progress</Text>
      </LinearGradient>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Text style={[styles.tabText, activeTab === "overview" && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "daily" && styles.activeTab]}
          onPress={() => setActiveTab("daily")}
        >
          <Text style={[styles.tabText, activeTab === "daily" && styles.activeTabText]}>Daily</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "insights" && styles.activeTab]}
          onPress={() => setActiveTab("insights")}
        >
          <Text style={[styles.tabText, activeTab === "insights" && styles.activeTabText]}>Insights</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "daily" && renderDailyTab()}
        {activeTab === "insights" && renderInsightsTab()}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    paddingTop: Platform.OS === "android" ? 40 : 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#4CAF50",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  activeTabText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  tabContent: {
    padding: 16,
  },
  summaryCardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  summaryCardTitle: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 8,
  },
  summaryCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
  },
  summaryCardValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendText: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 2,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#EEEEEE",
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: "#666666",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  barChart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  goalLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalLabel: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 6,
  },
  goalValues: {
    fontSize: 12,
    color: "#666666",
  },
  metricItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  metricLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dateHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  mealBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mealBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    marginLeft: 4,
  },
  mealsList: {
    marginTop: 8,
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  mealNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  mealNumberText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666666",
  },
  mealName: {
    fontSize: 14,
    color: "#333333",
  },
  nutrientGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  nutrientItem: {
    width: "50%",
    paddingVertical: 8,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  nutrientLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  insightsContainer: {
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginLeft: 8,
  },
  insightMessage: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  goalsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  goalBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  goalBadgeText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  bestDayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  bestDayInfo: {
    flex: 1,
  },
  bestDayLabel: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 4,
  },
  bestDayDate: {
    fontSize: 12,
    color: "#666666",
  },
  bestDayScore: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF5252",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
})

export default NutritionDashboard