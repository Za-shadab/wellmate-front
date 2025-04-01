import { useState, useEffect, useMemo } from "react"
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import { useNutritionistDetailContext } from "../../context/NutritionistContext"
import {URL} from "../../../constants/url"

// Sample notification data for a nutritionist app
const initialNotifications = [
  {
    id: "1",
    title: "New client registration",
    message: "Sarah Johnson has registered and is waiting for your approval",
    time: "5 min ago",
    read: false,
    type: "client",
    priority: "high",
    actionable: true,
    action: "viewClient",
  },
  {
    id: "2",
    title: "Meal plan viewed",
    message: "Michael Brown has viewed the meal plan you sent yesterday",
    time: "2 hours ago",
    read: false,
    type: "mealplan",
    priority: "medium",
    actionable: true,
    action: "viewMealPlan",
  },
  {
    id: "3",
    title: "Client feedback",
    message: "Emma Wilson left feedback on her weight loss meal plan",
    time: "Yesterday",
    read: true,
    type: "feedback",
    priority: "medium",
    actionable: true,
    action: "viewFeedback",
  },
  {
    id: "4",
    title: "Subscription renewal",
    message: "Your premium nutritionist subscription will renew in 7 days",
    time: "3 days ago",
    read: true,
    type: "system",
    priority: "low",
    actionable: false,
  },
  {
    id: "5",
    title: "Client check-in reminder",
    message: "Time for monthly check-in with David Miller (weight loss program)",
    time: "4 days ago",
    read: true,
    type: "reminder",
    priority: "high",
    actionable: true,
    action: "scheduleCheckIn",
  },
  {
    id: "6",
    title: "Meal plan expiring",
    message: "Jennifer Taylor's meal plan expires in 2 days. Create a new one?",
    time: "5 days ago",
    read: true,
    type: "mealplan",
    priority: "high",
    actionable: true,
    action: "createMealPlan",
  },
]

// Notification item component
const NotificationItem = ({ item, onPress, onActionPress }) => {
  // Choose icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case "client":
        return "person-add"
      case "mealplan":
        return "restaurant"
      case "feedback":
        return "chatbubble-ellipses"
      case "reminder":
        return "calendar"
      case "system":
        return "settings"
      default:
        return "notifications"
    }
  }

  // Choose icon color based on priority
  const getIconColor = (priority) => {
    switch (priority) {
      case "high":
        return "#e53935" // red for high priority
      case "medium":
        return "#43a047" // green for medium priority
      case "low":
        return "#1e88e5" // blue for low priority
      default:
        return "#43a047"
    }
  }

  // Get action button text based on action type
  const getActionText = (action) => {
    switch (action) {
      case "viewClient":
        return "View Profile"
      case "viewMealPlan":
        return "View Plan"
      case "viewFeedback":
        return "See Feedback"
      case "scheduleCheckIn":
        return "Schedule"
      case "createMealPlan":
        return "Create Plan"
      default:
        return "View"
    }
  }

  return (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => onPress(item.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${getIconColor(item.priority)}15` }]}>
        <Ionicons name={getIcon(item.type)} size={24} color={getIconColor(item.priority)} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.message}>{item.message}</Text>

        {item.actionable && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${getIconColor(item.priority)}15` }]}
            onPress={() => onActionPress(item.id, item.action)}
          >
            <Text style={[styles.actionText, { color: getIconColor(item.priority) }]}>
              {getActionText(item.action)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {!item.read && <View style={[styles.unreadDot, { backgroundColor: getIconColor(item.priority) }]} />}
    </TouchableOpacity>
  )
}

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { nutritionistDetail } = useNutritionistDetailContext()

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${URL}/api/notifications/${nutritionistDetail.nutritionistId}`)
      console.log("Notifications response:", response.data)
      if (response.data.success) {
        setNotifications(response.data.notifications)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.message)
      // Fallback to sample data during development
      setNotifications(initialNotifications)
    } finally {
      setLoading(false)
    }
  }

  // Mark as read
  const handleNotificationPress = async (id) => {
    try {
      const response = await axios.patch(`${URL}/api/notifications/${id}/read`)
      if (response.data.success) {
        fetchNotifications() // Refresh notifications
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await axios.patch(
        `${URL}/api/notifications/mark-all-read/${nutritionistDetail.nutritionistId}`,
      )
      if (response.data.success) {
        fetchNotifications() // Refresh notifications
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  useEffect(() => {
    fetchNotifications();

    // Set up polling for new notifications
    const pollInterval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [nutritionistDetail.userId]);

  // Handle action button press
  const handleActionPress = (id, actionType) => {
    handleNotificationPress(id);

    switch (actionType) {
      case "viewMealPlan":
        navigation.navigate('MealPlan', { 
          id: id,
          source: 'notification' 
        });
        break;
      case "viewClient":
        console.log("Navigate to client profile")
        // navigation.navigate('ClientProfile', { id: id });
        break
      case "viewMealPlan":
        console.log("Navigate to meal plan")
        // navigation.navigate('MealPlan', { id: id });
        break
      case "viewFeedback":
        console.log("Navigate to feedback")
        // navigation.navigate('Feedback', { id: id });
        break
      case "scheduleCheckIn":
        console.log("Navigate to scheduling")
        // navigation.navigate('Schedule', { clientId: id });
        break
      case "createMealPlan":
        console.log("Navigate to meal plan creation")
        // navigation.navigate('CreateMealPlan', { clientId: id });
        break
    }
  }

  // Filter notifications by type
  const [activeFilter, setActiveFilter] = useState("all")

  const filteredNotifications =
    activeFilter === "all" ? notifications : notifications.filter((n) => n.type === activeFilter)

  const filterOptions = [
    { id: "all", label: "All", icon: "apps" },
    { id: "client", label: "Clients", icon: "person" },
    { id: "mealplan", label: "Meal Plans", icon: "restaurant" },
    { id: "feedback", label: "Feedback", icon: "chatbubble" },
    { id: "reminder", label: "Reminders", icon: "calendar" },
  ]

  // Add unread count calculation
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllRead}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      {/* <View style={styles.filterContainer}>
        <FlatList
          data={filterOptions}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === item.id && styles.activeFilterTab]}
              onPress={() => setActiveFilter(item.id)}
            >
              <Ionicons name={item.icon} size={16} color={activeFilter === item.id ? "#43a047" : "#70757a"} />
              <Text style={[styles.filterText, activeFilter === item.id && styles.activeFilterText]}>{item.label}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View> */}

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </Text>
        </View>
      )}

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem item={item} onPress={handleNotificationPress} onActionPress={handleActionPress} />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No notifications in this category</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e4e8",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  markAllRead: {
    color: "#43a047",
    fontSize: 14,
    fontWeight: "500",
  },
  filterContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e4e8",
  },
  filterList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: "#f1f3f4",
  },
  activeFilterTab: {
    backgroundColor: "#e8f5e9",
  },
  filterText: {
    fontSize: 14,
    marginLeft: 4,
    color: "#70757a",
  },
  activeFilterText: {
    color: "#43a047",
    fontWeight: "500",
  },
  unreadBanner: {
    backgroundColor: "#e8f5e9",
    padding: 12,
    alignItems: "center",
  },
  unreadBannerText: {
    color: "#43a047",
    fontWeight: "500",
  },
  listContainer: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: "relative",
  },
  unreadNotification: {
    backgroundColor: "#fff",
    borderLeftWidth: 3,
    borderLeftColor: "#43a047",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    color: "#333",
  },
  time: {
    fontSize: 12,
    color: "#70757a",
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: "#5f6368",
    lineHeight: 20,
    marginBottom: 8,
  },
  actionButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  unreadDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#70757a",
  },
})

export default NotificationsScreen