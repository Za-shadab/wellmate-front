import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const NutritionistDetailContext = createContext();

export const useNutritionistDetailContext = () => {
  return useContext(NutritionistDetailContext);
};

export const NutritionistDetailProvider = ({ children }) => {
  const [nutritionistDetail, setNutritionistDetail] = useState({
    userId: "",
    nutritionistId: "",
    profileUrl: "",
    name: "",
  });
  const [mealPlan, setMealPlan] = useState(null);
  // Add refresh meal plan flag
  const [refreshMealPlanFlag, setRefreshMealPlanFlag] = useState(false);

  // Load user details from AsyncStorage
  useEffect(() => {
    const loadNutritionistData = async () => {
      try {
        const savedNutritionistDetail = await AsyncStorage.getItem("NutritionistDetail");
        if (savedNutritionistDetail) {
          setNutritionistDetail(JSON.parse(savedNutritionistDetail));
        }
      } catch (error) {
        console.log("Error loading Nutritionist details:", error);
      }
    };

    loadNutritionistData();
  }, []);

  // Update user detail and persist to AsyncStorage
  const updateNutritionistDetail = async (key, value) => {
    try {
      setNutritionistDetail((prevState) => {
        const newNutritionistDetail = { ...prevState, [key]: value };

        // Save updated details to AsyncStorage
        AsyncStorage.setItem("NutritionistDetail", JSON.stringify(newNutritionistDetail));

        return newNutritionistDetail;
      });
    } catch (error) {
      console.error("Error saving Nutritionist details:", error);
    }
  };

  return (
    <NutritionistDetailContext.Provider 
      value={{ 
        nutritionistDetail, 
        updateNutritionistDetail, 
        mealPlan, 
        setMealPlan,
        refreshMealPlanFlag,
        setRefreshMealPlanFlag 
      }}
    >
      {children}
    </NutritionistDetailContext.Provider>
  );
};