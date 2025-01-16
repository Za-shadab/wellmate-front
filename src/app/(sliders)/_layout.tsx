import React from "react";
import { CustomNavigator } from "../context/CustomStack"; // Ensure CustomStack is implemented correctly
import { Animated } from "react-native";
import { StackCardInterpolationProps } from "@react-navigation/stack";

export default function SlidersLayout() {
  // Custom card style interpolator for sliding transition
  const slideCardStyleInterpolator = ({
    current,
    next,
    layouts,
  }: StackCardInterpolationProps) => {
    const progress = Animated.add(current.progress, next ? next.progress : 0);

    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [layouts.screen.width, 0], // Slide from right
    });

    return {
      cardStyle: {
        transform: [{ translateX }],
      },
    };
  };

  return (
    <CustomNavigator
      screenOptions={{
        headerShown: false, // Hide headers for all screens
        cardStyleInterpolator: slideCardStyleInterpolator,
        transitionSpec: {
          open: {
            animation: "timing",
            config: {
              duration: 500, // Set duration for opening transition
            },
          },
          close: {
            animation: "timing",
            config: {
              duration: 500, // Set duration for closing transition
            },
          },
        },
      }}
    />
  );
}
