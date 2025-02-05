import React from "react";
import {View,Text,StyleSheet,} from "react-native";
import {useLocalSearchParams} from "expo-router"

  const mealDetailScreen = () =>{
    const { mealDetail } = useLocalSearchParams();
    const meal = typeof mealDetail === "string" ? JSON.parse(mealDetail) : mealDetail;

    console.log(meal);
    return(
        <View>
            <Text>Meal Detail Screen:{mealDetail}</Text>
        </View>
    )
  }

  export default mealDetailScreen