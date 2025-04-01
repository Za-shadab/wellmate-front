import React, { useState, useEffect } from 'react';
import { 
  Image, 
  View, 
  StyleSheet, 
  Pressable, 
  Text, 
  ActivityIndicator, 
  Animated, 
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRegistrationContext } from '../context/RegistrationContext';
import { useuserDetailContext } from '../context/UserDetailContext';
import { useNavigation } from 'expo-router';
import { URL } from '../../constants/url';
import { Ionicons } from '@expo/vector-icons';






export default function ImagePickerExample() {
  const [image, setImage] = useState(null);
  const { registrationData, updateRegistrationData } = useRegistrationContext();
  const { userDetail, updateUserDetail } = useuserDetailContext();
  const [status, setstatus] = useState(false);
  const [loading, setLoading] = useState(false); // Loader state
  const navigation = useNavigation();

  const pickImage = async () => {
    console.log('Button Pressed');
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
    try {
      if (!image) {
        console.log("No image selected!");
        return;
      }

      setLoading(true); // Start loading

      const formData = new FormData();
      formData.append('file', {
        uri: image,
        type: 'image/jpeg',
        name: `profile_image.jpg`,
      });

      const response = await axios.post(
        `${URL}/pfupload/profileUpload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      console.log('Server response:', response.data.url);

      const data = {
        UserId: userDetail.userId,
        age: registrationData.age,
        height: registrationData.height,
        weight: registrationData.weight,
        gender: registrationData.gender,
        activityLevel: registrationData.activityLevel,
        goals: registrationData.goals,
        profileUrl: response.data.url,
        goalWeight: registrationData.Goalweight !== undefined ? registrationData.Goalweight : null,
        weightchangeRate: registrationData.weightchangeRate !== undefined ? registrationData.weightchangeRate : null
      };
      console.log(data);
      
      const response2 = await axios.post(
        `${URL}/regular/regularUsers`,
        data
      );
      console.log(response2);
      
      console.log('Second response:', response2.data);

      updateUserDetail('regularId', response2.data._id);
      updateUserDetail('profileUrl', response.data.url);
      updateUserDetail('name', registrationData.name)

      const data2 = {
        regularUserId: response2.data._id, // Now using updated value
        allergens: registrationData.allergens,
        dietType: registrationData.dietType,
      };
      console.log("Sending dietary preferences:", data2);

      const response3 = await axios.post(
        `${URL}/preference/dietary-preferences`,
        data2
      );
      console.log("Third response:", response3);

      setstatus(true);
      console.log("Registration completed!");

    } catch (err) {
      console.log('Error sending data:', err.response);
    } finally {
      setLoading(false); // Stop loading after completion
    }
  };

  useEffect(() => {
    if (status) {
      console.log("Navigating to (tabs)");
      navigation.navigate('(tabs)');
    }
  }, [status]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile Picture</Text>
      <Text style={styles.subHeading}>Choose a photo for your profile</Text>

      <View style={styles.imgContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.placeholderText}>No Image Selected</Text>
        )}
      </View>

      <Pressable style={styles.button} onPress={pickImage}>
        <Text style={styles.btnText}>+</Text>
      </Pressable>

      <Text style={styles.instructions}>
        Tap the button to select your profile picture from your device's gallery.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1e90ff" style={styles.loader} />
      ) : (
        <Pressable
          style={styles.finishButton}
          onPress={async () => {
          await submitInfo();  // Wait for submitInfo to complete
          }}
        >
          <Text style={styles.finishButtonText}>Finish</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 20,
    color: '#555',
  },
  imgContainer: {
    width: 250,
    height: 250,
    backgroundColor: '#e0e0e0',
    borderRadius: 125,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 125,
  },
  placeholderText: {
    color: '#808080',
    fontSize: 18,
    fontStyle: 'italic',
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1e90ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  btnText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    color: '#777',
    marginTop: 10,
  },
  finishButton: {
    width: 200,
    height: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 20,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
});
