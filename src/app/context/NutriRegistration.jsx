import React, { createContext, useState, useContext } from 'react';

// Create the context
const NutriRegistrationContext = createContext();

// Create a custom hook to use the context
export const useNutriRegistrationContext = () => {
  return useContext(NutriRegistrationContext);
};

// Create a provider component
export const NutriRegistrationProvider = ({ children }) => {
  // Define the state for registration
  const [nutriregistrationData, setNutriRegistrationData] = useState({
    experience:'',
    gender:'',
    age:'',
    brandname:'',
    brandlogo:'',
    tagline:'',
    subscripitionStatus:'',
    specialization:'',
    certifications:'',
  });

  // Function to update registration data
  const updateNutriRegistrationData = (key, value) => {
    setNutriRegistrationData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <NutriRegistrationContext.Provider value={{ nutriregistrationData, updateNutriRegistrationData }}>
      {children}
    </NutriRegistrationContext.Provider>
  );
};