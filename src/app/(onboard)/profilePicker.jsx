import { useState } from 'react';
import { Image, View, StyleSheet, Pressable, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRegistrationContext } from '../context/RegistrationContext';
import { useuserDetailContext } from '../context/UserDetailContext';
import { useNavigation } from 'expo-router';

export default function ImagePickerExample() {
  const [image, setImage] = useState(null);
  const {registrationData, updateRegistrationData} = useRegistrationContext({});
  const {userDetail, updateUserDetail} = useuserDetailContext({});
  const [status, setstatus] = useState(false);
  console.log("user detail......................", userDetail);
  
  const navigation = useNavigation();
  
  const pickImage = async () => {
    console.log('Button Pressed'); // Check if the function is being called
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos','images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      // base64: true,
    });
  
    if (!result.canceled) {
      setImage(result.assets[0].uri);

      updateRegistrationData('profileUrl', result.assets[0].uri)
      const formData = new FormData();
      formData.append('file', {
        uri: result.assets[0].uri,
        type: result.assets[0].uri.endsWith('.png') ? 'image/png' : 'image/jpeg',  // Dynamically set type
        name: `profile_image.${result.assets[0].uri.split('.').pop()}`,  // Customize the name as per your need
      });
  
  
    (async () => {
      try{
        const response = await axios.post('http://192.168.0.113:3000/pfupload/profileUpload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        console.log('Server response is:', response.data.url);

        const data = {
          userId : userDetail.userId,
          age : registrationData.age,
          height : registrationData.height,
          weight : registrationData.weight,
          gender: registrationData.gender,
          activityLevel : registrationData.activityLevel,
          goals : registrationData.goals,
          profileUrl : response.data.url
        };

        
        const response2 = await axios.post('http://192.168.0.140:3000/regular/regularUsers', data)
        console.log('Servers Second response is:', response2);
        setstatus(true)
        await updateUserDetail('regularId', response2.data.regularUserId)
        const data2 = {
          regularUserId: userDetail.regularId,
          allergens: registrationData.allergens,
          dietType: registrationData.dietType
        }

        const response3 = await axios.post('http://192.168.0.113://3000/preference/dietary-preferences', data2)
        console.log("server third response is: ", response3);
        
      }catch(err){
        console.log('error sending data',err.message);
      }
    })()

    }else{
      Alert.alert("Image selection was canceled.");
    }
  };


const handleFinish = ()=>{
    console.log("Profile photo update finish");
    navigation.navigate('(tabs)')
}

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile Picture</Text>
      <Text style={styles.subHeading}>Choose a photo for your profile</Text>

      <View style={styles.imgContainer}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.placeholderText}>No Image Selected</Text>
        )}
      </View>

      <Pressable 
        style={styles.button} 
        onPress={pickImage}
        onPressIn={() => console.log('Button Press In')}
        onPressOut={() => console.log('Button Press Out')}
      >
        <Text style={styles.btnText}>+</Text>
      </Pressable>

      <Text style={styles.instructions}>
        Tap the button to select your profile picture from your device's gallery.
      </Text>


      <Pressable style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>Finish</Text>
      </Pressable>  
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
    backgroundColor: '#4CAF50',  // Green color
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
});
