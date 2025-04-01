import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Animated, Easing, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "expo-router";
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNutriRegistrationContext } from '../context/NutriRegistration';
import axios from "axios";
import { URL } from "@/src/constants/url";

const BrandingScreen = () => {
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState(null);
  const [tagline, setTagline] = useState("");
  const [website, setWebsite] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { updateNutriRegistrationData } = useNutriRegistrationContext();
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const logoAnimation = useRef(new Animated.Value(0)).current;

  // Check if required fields are filled to enable the submit button
  const isFormValid = companyName.trim() !== "" && companyLogo !== null && tagline.trim() !== "";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoAnimation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const pickImage = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Permission to access media library is required!");
        return;
      }
    
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        setCompanyLogo(selectedImageUri);
        
        // Upload the image to server
        await uploadImage(selectedImageUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      setIsUploading(true);
      
      // Create form data for the image upload
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';
      
      // Use 'profileImage' as the field name since that's what the server expects
      formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
      });
      
      console.log("Uploading image with formData:", formData);
      
      // Upload the image to server
      const response = await axios.post(`${URL}/pfupload/profileUpload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // console.log("Upload response:", response.data);
      
      if (response.data && response.data.imageUrl) {
        // Store the server URL for the uploaded image
        // updateNutriRegistrationData('brandlogo', response.data.imageUrl); // commented on 25/03/2025 night by me
        updateNutriRegistrationData('brandlogo', response.data.url); // added on 25/03/2025 night by me for testing purpose
      } else {
        // If server doesn't return an image URL, use the local URI as fallback
        updateNutriRegistrationData('brandlogo', imageUri);
      }
      
    } catch (error) {
      console.error("Error uploading image:", error?.response?.data || error.message);
      Alert.alert("Upload Failed", "Failed to upload image. Please try again.");
      // Keep the local URI as fallback
      updateNutriRegistrationData('brandlogo', imageUri);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!isFormValid) {
      Alert.alert("Missing Information", "Please fill in company name, logo, and tagline before proceeding.");
      return;
    }
    
    updateNutriRegistrationData('brandname', companyName);
    updateNutriRegistrationData('tagline', tagline);
    if (website) {
      updateNutriRegistrationData('website', website);
    }
    navigation.navigate("paymentscreen");
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient colors={['#fff', '#fff']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.title}>Branding Setup</Text>
            
            <TouchableOpacity 
              onPress={pickImage} 
              style={styles.logoPicker}
              disabled={isUploading}
            >
              {companyLogo ? (
                <Image source={{ uri: companyLogo }} style={styles.logo} />
              ) : (
                <Animated.View style={[styles.logoPlaceholder, { transform: [{ scale: logoAnimation.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.05] }) }] }]}>
                  <AntDesign name="camerao" size={40} color="#Ffa500" />
                  <Text style={styles.logoText}>
                    {isUploading ? "Uploading..." : "Select Logo"}
                  </Text>
                </Animated.View>
              )}
              {isUploading && (
                <View style={styles.uploadingOverlay}>
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TextInput
              placeholder="Company Name *"
              value={companyName}
              onChangeText={setCompanyName}
              style={styles.input}
            />
            
            <TextInput
              placeholder="Tagline *"
              value={tagline}
              onChangeText={setTagline}
              style={styles.input}
            />
            
            <TextInput
              placeholder="Website (Optional)"
              value={website}
              onChangeText={setWebsite}
              style={styles.input}
              keyboardType="url"
              autoCapitalize="none"
            />
            
            <TouchableOpacity 
              onPress={handleSubmit} 
              style={[styles.button, !isFormValid && styles.buttonDisabled]}
              disabled={!isFormValid || isUploading}
            >
              <LinearGradient 
                colors={isFormValid ? ['#1DB9E2', '#4A90E2'] : ['#ccc', '#999']} 
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {isUploading ? "Uploading..." : "Save Branding"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {!isFormValid && (
              <Text style={styles.requiredFieldsNote}>
                * Required fields must be completed
              </Text>
            )}
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoPicker: {
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 75,
    padding: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  logoPlaceholder: {
    width: 140,
    height: 140,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 70,
  },
  logoText: {
    color: "#4CAF50",
    marginTop: 10,
    fontWeight: "600",
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: "#4A90E2",
    width: "100%",
    marginBottom: 25,
    padding: 12,
    fontSize: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
  },
  button: {
    width: "100%",
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  requiredFieldsNote: {
    marginTop: 15,
    color: "#FF6B6B",
    fontSize: 14,
  },
});

export default BrandingScreen;