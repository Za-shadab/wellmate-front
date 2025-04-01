"use client"

import { useState } from "react"
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"

// Sample notification data
const initialNotifications = [
  // {
  //   id: "1",
  //   title: "New message from Sarah",
  //   message: "Hey, how are you doing?",
  //   time: "5 min ago",
  //   read: false,
  //   type: "message",
  // },
  // {
  //   id: "2",
  //   title: "Payment successful",
  //   message: "Your subscription has been renewed",
  //   time: "2 hours ago",
  //   read: false,
  //   type: "payment",
  // },
  // {
  //   id: "3",
  //   title: "Friend request",
  //   message: "John Smith wants to connect with you",
  //   time: "Yesterday",
  //   read: true,
  //   type: "social",
  // },
  // {
  //   id: "4",
  //   title: "System update",
  //   message: "App updated to version 2.0",
  //   time: "3 days ago",
  //   read: true,
  //   type: "system",
  // },
  // {
  //   id: "5",
  //   title: "Event reminder",
  //   message: "Team meeting tomorrow at 10 AM",
  //   time: "4 days ago",
  //   read: true,
  //   type: "calendar",
  // },
]

// Notification item component
const NotificationItem = ({ item, onPress }) => {
  // Choose icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case "message":
        return "chatbubble-ellipses"
      case "payment":
        return "card"
      case "social":
        return "person-add"
      case "calendar":
        return "calendar"
      case "system":
        return "settings"
      default:
        return "notifications"
    }
  }

  // Choose icon color based on notification type
  const getIconColor = (type) => {
    switch (type) {
      case "message":
        return "#4285F4"
      case "payment":
        return "#34A853"
      case "social":
        return "#FBBC05"
      case "calendar":
        return "#EA4335"
      case "system":
        return "#9AA0A6"
      default:
        return "#4285F4"
    }
  }

  return (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => onPress(item.id)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={getIcon(item.type)} size={24} color={getIconColor(item.type)} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.message}>{item.message}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  )
}

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState(initialNotifications)
  const unreadCount = notifications.filter((n) => !n.read).length

  // Mark notification as read
  const handleNotificationPress = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

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

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem item={item} onPress={handleNotificationPress} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
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
  },
  markAllRead: {
    color: "#4285F4",
    fontSize: 14,
    fontWeight: "500",
  },
  unreadBanner: {
    backgroundColor: "#EAF2FF",
    padding: 12,
    alignItems: "center",
  },
  unreadBannerText: {
    color: "#4285F4",
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
    borderLeftColor: "#4285F4",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f3f4",
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
  },
  unreadDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4285F4",
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