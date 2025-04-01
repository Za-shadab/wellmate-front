import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserDetailContext = createContext();

export const useuserDetailContext = () => {
  return useContext(UserDetailContext);
};

export const UserDetailProvider = ({ children }) => {
  const [userDetail, setUserDetail] = useState({
    userId: '',
    regularId: '',
    profileUrl: '',
    name:'',
  });

  // Load user details from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUserDetail = await AsyncStorage.getItem('userDetail');
        if (savedUserDetail) {
          setUserDetail(JSON.parse(savedUserDetail)); // Parse the stored JSON string
        }
      } catch (error) {
        console.error('Error loading user details:', error);
      }
    };
    
    loadUserData();
  }, []);

  // Update user detail and persist to AsyncStorage
  const updateUserDetail = (key, value) => {
    setUserDetail((prevState) => {
      const newUserDetail = { ...prevState, [key]: value };
      // Save updated user detail to AsyncStorage
      AsyncStorage.setItem('userDetail', JSON.stringify(newUserDetail));
      return newUserDetail;
    });
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, updateUserDetail }}>
      {children}
    </UserDetailContext.Provider>
  );
};
