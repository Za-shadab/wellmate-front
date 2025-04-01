"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Pressable,
} from "react-native"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import RNPickerSelect from "react-native-picker-select"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  FadeInDown,
} from "react-native-reanimated"
import { TouchableOpacity as GestureHandlerButton } from "react-native-gesture-handler"
import { useNavigation, useRouter } from "expo-router"
import { useNutritionistDetailContext } from "../../context/NutritionistContext"
import { useSavedPlanContext } from "../../context/savedPlanContext"
import axios from "axios"
import { URL } from "../../../constants/url"

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(GestureHandlerButton)
const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function CreateSavedPlanScreen() {
  const [selectedUser, setSelectedUser] = useState("alexander_lee")
  const [numberOfDays, setNumberOfDays] = useState("7")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [activeInput, setActiveInput] = useState(null)
  const navigation = useNavigation()
  const { nutritionistDetail } = useNutritionistDetailContext({})
  const { savedPlanData, updateSavedPlanData } = useSavedPlanContext()
  const [clientsList, setClientsList] = useState([])
  const router = useRouter()

  // Days options for dropdown
  const daysOptions = [
    { label: "2 days", value: "3" },
    { label: "3 days", value: "3" },
    { label: "4 days", value: "4" },
    { label: "5 days", value: "5" },
    { label: "6 days", value: "6" },
    { label: "7 days", value: "7" },
  ]

  // Animation values
  const animation = useSharedValue(0)
  const buttonScale = useSharedValue(1)
  const cancelButtonScale = useSharedValue(1)

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animation.value, [0, 1], [0, 1]),
      transform: [{ translateY: interpolate(animation.value, [0, 1], [20, 0]) }],
    }
  })

  const generateButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    }
  })

  const cancelButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cancelButtonScale.value }],
    }
  })

  // Start entrance animation
  useEffect(() => {
    animation.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    })
  }, [])

  // Button press animations
  const handleGeneratePress = () => {
    buttonScale.value = withTiming(0.95, { duration: 100 })
    setTimeout(() => {
      buttonScale.value = withTiming(1, { duration: 100 })
      handleSave()
    }, 100)
  }

  const handleCancelPress = () => {
    cancelButtonScale.value = withTiming(0.95, { duration: 100 })
    setTimeout(() => {
      cancelButtonScale.value = withTiming(1, { duration: 100 })
      navigation.goBack()
    }, 100)
  }

  const getclients = async () => {
    try {
      const response = await axios.post(`${URL}/create/get-clientProfile`, {
        NutritionistId: nutritionistDetail.nutritionistId,
      })

      const { clientUsers, clientUsersProfile } = response.data

      const clientsres = clientUsers.map((client, index) => {
        return {
          id: client._id,
          userId: clientUsersProfile[index]?._id,
          name: client.name,
          email: client.email,
          plan: "sample",
          profileimg: require("../../../../assets/images/Frame__1_-removebg-preview.png"),
          goals: clientUsersProfile[index]?.goals || "No goals set",
          age: clientUsersProfile[index]?.age || "",
        }
      })

      setClientsList(clientsres)
    } catch (error) {
      console.log("Error fetching clients:", error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      getclients()
    }, []),
  )

  const clients = clientsList.map((client) => {
    return {
      id: client.id,
      clientUserId: client.userId,
      name: client.name,
      age: client.age,
      goal: client.goals,
    }
  })

  // Input focus styles
  const getInputStyle = (inputName) => {
    return [
      styles.input,
      inputName === activeInput && styles.inputFocused,
      inputName === "description" && styles.textArea,
    ]
  }

  const handleSave = () => {
    // Implement save logic here
    updateSavedPlanData("userId", selectedUser)
    updateSavedPlanData("numberOfDays", numberOfDays)
    navigation.replace("savedplans")
    // router.replace('/(nutritionist)/savedplans')
    console.log("Generating plan...")
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.duration(600).springify()} style={[styles.content, animatedStyle]}>
          <View style={styles.header}>
            <Text style={styles.heading}>Create Saved Plan</Text>
            <Text style={styles.subheading}>Create a meal plan template that you can reuse later</Text>
          </View>

          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Text style={styles.label}>User</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="account" size={20} color="#64748B" />
              </View>
              <View style={styles.pickerContainer}>
                <RNPickerSelect
                  onValueChange={(value) => setSelectedUser(value)}
                  items={clientsList.map((client) => ({
                    label: client.name,
                    value: client.userId,
                  }))}
                  style={pickerSelectStyles}
                  value={selectedUser}
                  useNativeAndroidPickerStyle={false}
                  Icon={() => <Ionicons name="chevron-down" size={20} color="#64748B" />}
                  placeholder={{ label: "Select a user", value: null }}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <Text style={styles.label}>Number of days</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="calendar-range" size={20} color="#64748B" />
              </View>
              <View style={styles.pickerContainer}>
                <RNPickerSelect
                  onValueChange={(value) => setNumberOfDays(value)}
                  items={daysOptions}
                  style={pickerSelectStyles}
                  value={numberOfDays}
                  useNativeAndroidPickerStyle={false}
                  Icon={() => <Ionicons name="chevron-down" size={20} color="#64748B" />}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={styles.label}>Title</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="format-title" size={20} color="#64748B" />
              </View>
              <TextInput
                style={getInputStyle("title")}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter a descriptive title"
                placeholderTextColor="#94A3B8"
                onFocus={() => setActiveInput("title")}
                onBlur={() => setActiveInput(null)}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).duration(500)}>
            <Text style={styles.label}>Description</Text>
            <View style={styles.textAreaWrapper}>
              <TextInput
                style={getInputStyle("description")}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe what this meal plan includes..."
                placeholderTextColor="#94A3B8"
                multiline
                onFocus={() => setActiveInput("description")}
                onBlur={() => setActiveInput(null)}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="tag-multiple" size={20} color="#64748B" />
              </View>
              <TextInput
                style={getInputStyle("tags")}
                value={tags}
                onChangeText={setTags}
                placeholder="keto, low-carb, vegan, etc."
                placeholderTextColor="#94A3B8"
                onFocus={() => setActiveInput("tags")}
                onBlur={() => setActiveInput(null)}
              />
            </View>
          </Animated.View>

          <Animated.View style={styles.buttonContainer} entering={FadeInDown.delay(350).duration(500)}>
            <AnimatedPressable style={[styles.cancelButton, cancelButtonStyle]} onPress={handleCancelPress}>
              <Text style={styles.cancelText}>Cancel</Text>
            </AnimatedPressable>

            <AnimatedPressable style={[styles.generateButton, generateButtonStyle]} onPress={handleGeneratePress}>
              <Text style={styles.generateText}>Generate</Text>
              <MaterialCommunityIcons name="lightning-bolt" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            </AnimatedPressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 22,
  },
  label: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  iconContainer: {
    width: 40,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRightWidth: 0,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    height: 48,
    justifyContent: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    color: "#1E293B",
    padding: 12,
    paddingLeft: 16,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 16,
    height: 48,
  },
  inputFocused: {
    borderColor: "#3B82F6",
    borderWidth: 2,
    backgroundColor: "#F8FAFC",
  },
  textAreaWrapper: {
    marginBottom: 4,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    borderRadius: 12,
    paddingTop: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    marginBottom: 16,
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cancelText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
  },
  generateButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  generateText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginLeft: 8,
  },
})

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: "#1E293B",
    height: 46,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: "#1E293B",
    height: 46,
  },
  iconContainer: {
    top: 14,
    right: 12,
  },
})

