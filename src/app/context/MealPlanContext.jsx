import React, { createContext, useContext, useState } from 'react';

const MealPlanContext = createContext();

export const MealPlanProvider = ({ children }) => {
  const [mealPlanData, setMealPlanData] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealType, setMealType] = useState('Breakfast');

  const updateSelectedRecipe = (mealType, recipe) => {
    setSelectedMeal(recipe);
    setMealType(mealType);
    // Update meal plan data if needed
    if (mealPlanData) {
      const updatedMealPlan = {
        ...mealPlanData,
        [mealType.toLowerCase()]: recipe
      };
      setMealPlanData(updatedMealPlan);
    }
  };

  return (
    <MealPlanContext.Provider 
      value={{ 
        mealPlanData, 
        setMealPlanData,
        selectedMeal,
        setSelectedMeal,
        mealType,
        setMealType,
        updateSelectedRecipe
      }}
    >
      {children}
    </MealPlanContext.Provider>
  );
};

export const useMealPlanContext = () => {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlanContext must be used within a MealPlanProvider');
  }
  return context;
};