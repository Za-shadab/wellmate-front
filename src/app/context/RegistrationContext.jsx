import React, { createContext, useState, useContext } from 'react';

// Create the context
const RegistrationContext = createContext();

// Create a custom hook to use the context
export const useRegistrationContext = () => {
  return useContext(RegistrationContext);
};

// Create a provider component
export const RegistrationProvider = ({ children }) => {
  // Define the state for registration
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    role: '',
    goals: '',
    gender:'',
    age:'',
    height:'',
    weight:'',
    activityLevel:'',
    dietType:'',
    allergens:'',
    // restrictedIngredients:'',
    profileUrl:'',
    // Add more fields as needed
  });

  // Function to update registration data
  const updateRegistrationData = (key, value) => {
    setRegistrationData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <RegistrationContext.Provider value={{ registrationData, updateRegistrationData }}>
      {children}
    </RegistrationContext.Provider>
  );
};