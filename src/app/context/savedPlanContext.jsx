import React, { createContext, useState, useContext } from 'react';

// Create the context
const SavedPlanContext = createContext();

// Create a custom hook to use the context
export const useSavedPlanContext = () => {
  return useContext(SavedPlanContext);
};

// Create a provider component
export const SavedPlanProvider = ({ children }) => {
  // Define the state for registration
  const [savedPlanData, setSavedPlanData] = useState({
    userId: '',
    numberOfDays: 0,
    dietaryPreferences:[],
  });

  // Function to update registration data
  const updateSavedPlanData = (key, value) => {
    setSavedPlanData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <SavedPlanContext.Provider value={{ savedPlanData, updateSavedPlanData }}>
      {children}
    </SavedPlanContext.Provider>
  );
};