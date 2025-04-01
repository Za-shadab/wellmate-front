import React, { useState, useRef } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, Dimensions, Animated } from "react-native";
import { useNavigation } from "expo-router";
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    image: require("../../../assets/images/Frame__1_-removebg-preview.png"),
    title: "Welcome to WellMate",
    description: "Empower your clients with personalized nutrition and fitness plans. Get started by setting up your branding."
  },
  {
    id: "2",
    image: require("../../../assets/images/Frame__1_-removebg-preview.png"),
    title: "Set Up Your Brand",
    description: "Upload your logo, enter your business details, and create a strong brand identity."
  },
  {
    id: "3",
    image: require("../../../assets/images/Frame__1_-removebg-preview.png"),
    title: "Manage Clients Easily",
    description: "Track your clients' diet plans, workouts, and progress in one place."
  }
];

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToOffset({ offset: (currentIndex + 1) * width, animated: true });
    } else {
      navigation.navigate("credentials");
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ width, alignItems: "center", padding: 20, justifyContent: "center" }}>
      <Image source={item.image} style={{ width: width * 0.8, height: height * 0.4, marginBottom: 30, borderRadius: 20 }} resizeMode="cover" />
      <Text style={{ fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 15, color: "#333" }}>{item.title}</Text>
      <Text style={{ fontSize: 18, textAlign: "center", marginBottom: 20, color: "#666", paddingHorizontal: 20 }}>{item.description}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <LinearGradient colors={['#f0f8ff', '#e6f3ff', '#d9edff']} style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={renderItem}
        />
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: index === currentIndex ? "#4CAF50" : "#ccc",
                marginHorizontal: 5,
              }}
            />
          ))}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "90%", paddingHorizontal: 20, paddingBottom: 40, alignSelf: "center" }}>
          {currentIndex < slides.length - 1 ? (
            <TouchableOpacity onPress={() => navigation.navigate("credentials")} style={{ padding: 10 }}>
              <Text style={{ fontSize: 18, color: "#4CAF50", fontWeight: "600" }}>Skip</Text>
            </TouchableOpacity>
          ) : <View />}
          <TouchableOpacity
            onPress={handleNext}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#4CAF50",
              alignItems: "center",
              justifyContent: "center",
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
          >
            <AntDesign name="arrowright" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

export default OnboardingScreen;