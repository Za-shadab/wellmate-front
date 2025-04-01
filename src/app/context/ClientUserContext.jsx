import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ClientUserContext = createContext();

export const useClientUserContext = () => {
  return useContext(ClientUserContext);
};

export const ClientUserProvider = ({ children }) => {
  const [clientUser, setClientUser] = useState({
    clientId: '',
    clientUserId: '',
    clientName: '',
    clientProfileUrl: '',
    clientEmail: '',
    nurtionistId: '',
  });

  // Load client user details from AsyncStorage
  useEffect(() => {
    const loadClientUserData = async () => {
      try {
        const savedClientUser = await AsyncStorage.getItem('clientUser');
        if (savedClientUser) {
          setClientUser(JSON.parse(savedClientUser)); // Parse the stored JSON string
        }
      } catch (error) {
        console.error('Error loading client user details:', error);
      }
    };

    loadClientUserData();
  }, []);

  // Update client user detail and persist to AsyncStorage
  const updateClientUser = (key, value) => {
    setClientUser((prevState) => {
      const newClientUser = { ...prevState, [key]: value };
      // Save updated client user detail to AsyncStorage
      AsyncStorage.setItem('clientUser', JSON.stringify(newClientUser));
      return newClientUser;
    });
  };

  return (
    <ClientUserContext.Provider value={{ clientUser, updateClientUser }}>
      {children}
    </ClientUserContext.Provider>
  );
};