import { useState, useEffect, useRef } from 'react';
import { 
  Image, 
  View, 
  StyleSheet, 
  Pressable, 
  Text, 
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  SafeAreaView,
  StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRegistrationContext } from '../context/RegistrationContext';
import { useuserDetailContext } from '../context/UserDetailContext';
import { useNavigation,useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useClientRegistrationContext } from "../context/ClientRegistration";
import {useNutritionistDetailContext} from '../context/NutritionistContext'
import { URL } from '../../constants/url';




export default function ImagePickerExample() {
  const [image, setImage] = useState(null);
  const { registrationData, updateRegistrationData } = useRegistrationContext();
  const { userDetail, updateUserDetail } = useuserDetailContext();
  const {nutritionistDetail, updateNutritionistDetail} = useNutritionistDetailContext({});
  const {ClientregistrationData,updateClientRegistrationData} = useClientRegistrationContext({});
  const [status, setstatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    // Continuous rotation animation for loading state
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, []);

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pickImage = async () => {
    animateButtonPress();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      updateRegistrationData('profileUrl', uri);
    }
  };

  const submitInfo = async () => {
    if (!image) {
      // Add some visual feedback for no image selected
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: image,
        type: 'image/jpeg',
        name: 'profile_image.jpg',
      });

      const response = await axios.post(
        `${URL}/pfupload/profileUpload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const data = {
        UserId: ClientregistrationData.id,
        NutritionistId: nutritionistDetail.nutritionistId,
        age: registrationData.age,
        height: registrationData.height,
        weight: registrationData.weight,
        gender: registrationData.gender,
        activityLevel: registrationData.activityLevel,
        goals: registrationData.goals,
        profileUrl: response.data.url,
        goalWeight: registrationData.Goalweight ?? null,
        weightchangeRate: registrationData.weightchangeRate ?? null,
        onboardingStatus: "in_progress",
        healthConditions:registrationData.healthConditions,
        diabetesMeds:registrationData.diabetesMeds,
        insulinUse:registrationData.insulinUse,
        pcosMeds:registrationData.pcosMeds,
        thyroidType:registrationData.thyroidType,
        tshLevels:registrationData.tshLevels, 
        permissions: registrationData.permissions, 
      };
      console.log(data,".........");
      
      const response2 = await axios.post(
        `${URL}/create/create-client-nutritional-profile`,
        data
      );

      // updateUserDetail('regularId', response2.data._id);
      // updateUserDetail('profileUrl', response.data.url);
      // updateUserDetail('name', registrationData.name);
      // console.log("check Id",response2.data.client.UserId,registrationData.allergens,registrationData.dietType);
      
      const data2 = {
        clientUserId: response2.data.client._id,
        allergens: registrationData.allergens,
        dietType: registrationData.dietType,
      };
      console.log(data2);
      
      const response3 = await axios.post(
        `${URL}/preference/dietary-preferences`,
        data2
      );
      console.log("Second response for dietary preference",response3)
      setstatus(true);

    } catch (err) {
      console.log('Error sending data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status) {
      // navigation.navigate('(tabs)');
      router.replace('/(nutritionist)')
    }
  }, [status]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Profile Picture</Text>
          <Text style={styles.subHeading}>Choose a photo for your profile</Text>
        </View>

        <Animated.View 
          style={[
            styles.imgContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderContainer}>
              <MaterialIcons name="person" size={80} color="#A0AEC0" />
              <Text style={styles.placeholderText}>No Image Selected</Text>
            </View>
          )}
          
          <Animated.View 
            style={[
              styles.editButton,
              { transform: [{ scale: buttonScaleAnim }] }
            ]}
          >
            <Pressable style={styles.editButtonInner} onPress={pickImage}>
              <MaterialIcons name="add-a-photo" size={24} color="#FFFFFF" />
            </Pressable>
          </Animated.View>
        </Animated.View>

        <Text style={styles.instructions}>
          Add a profile picture to personalize your account
        </Text>

        {loading ? (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.finishButtonContainer,
              { transform: [{ scale: buttonScaleAnim }] }
            ]}
          >
            <Pressable
              style={[styles.finishButton, !image && styles.finishButtonDisabled]}
              onPress={submitInfo}
              disabled={!image}
            >
              <Text style={styles.finishButtonText}>Complete Setup</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subHeading: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
  imgContainer: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#A0AEC0',
    fontSize: 16,
    marginTop: 12,
  },
  editButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    color: '#718096',
    marginBottom: 32,
    maxWidth: 280,
    lineHeight: 20,
  },
  finishButtonContainer: {
    width: '100%',
    maxWidth: 320,
    marginTop: 'auto',
  },
  finishButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonDisabled: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0.1,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    letterSpacing: 0.5,
  },
});