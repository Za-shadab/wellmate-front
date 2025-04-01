import React, { createContext, useState, useContext } from 'react';

// Create the context
const ClientRegistrationContext = createContext();

// Create a custom hook to use the context
export const useClientRegistrationContext = () => {
  return useContext(ClientRegistrationContext);
};

// Create a provider component
export const ClientRegistrationProvider = ({ children }) => {
  // Define the state for registration
  const [ClientregistrationData, setClientRegistrationData] = useState({
    id:'',
    name: '',
    email: '',
    password: '',
    location: '',
    role: '',
    createdBy:'',
  });

  // Function to update registration data
  const updateClientRegistrationData = (key, value) => {
    setClientRegistrationData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <ClientRegistrationContext.Provider value={{ ClientregistrationData, updateClientRegistrationData }}> 
      {children}
    </ClientRegistrationContext.Provider>
  );
};