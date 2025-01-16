import React, { useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image, Pressable,ScrollView, StatusBar, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import uselocation from '../../hooks/uselocation';
import Animated, { FadeInDown, BounceOut, BounceInUp } from 'react-native-reanimated';
import {Link} from 'expo-router'
import axios from 'axios'
import { useNavigation} from 'expo-router';
import { useRegistrationContext } from '../context/RegistrationContext';



// Validation schema with yup
const registrationSchema = yup.object().shape({
  name: yup.string()
  .matches(
    /^[a-zA-Z_]{2,20}$/,
    "Name must be between 5 and 20 characters and can only contain letters and underscores"
  )
  .required('Full Name is required'),
  email: yup.string()
  .matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com)$/,
    'Invalid email'
  ).required('Email is required'),
  password: yup.string().matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!~])[A-Za-z\d@#$%^&*!~]{5,20}$/,
    "Password must be 5-20 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (@#$%^&*!~), and must not include quotes"
  ).required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm Password is required'),
  location: yup.string(),
});

export default function RegisterScreen() {

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(registrationSchema),
  });
  const { location, address, errorMsg } = uselocation();
  const navigation = useNavigation();
  // console.log("Navigation",navigation);
  const { registrationData, updateRegistrationData } = useRegistrationContext({});
  useEffect(()=>{
    console.log("Context Information....................................", registrationData);
  },[registrationData])

  const onSubmit = data => {
    data.location = address;
    data.role = 'regular_user'
    // console.log(data); // Log form data 
    updateRegistrationData('name', data.name)
    updateRegistrationData('email', data.email)
    updateRegistrationData('password', data.password)
    updateRegistrationData('location', data.location)
    updateRegistrationData('role', data.role)

  

    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      location: address,
      role: data.role
    }
    console.log("Payload", payload);
    
    (async () => {
      try{
        const response = await axios.post('http://192.168.200.148:3000/api/register', payload)
        console.log('Server response is:', response.data);
        console.log('Navigating to health...');
        navigation.navigate('(onboard)');
      }catch(err){
        console.log('error sending data',err.message);
      }
    })()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
          <Animated.View
            entering={FadeInDown.duration(1000)}
          >
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
            </Animated.View>
          </>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
          <Animated.View
            entering={FadeInDown.delay(100).duration(1000)}
          >
            <TextInput
              style={styles.input}
              placeholder="Email"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
            </Animated.View>
          </>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
          <Animated.View
            entering={FadeInDown.delay(200).duration(1000)}
          >
            <TextInput
              style={styles.input}
              placeholder="Password"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
            />
            {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
            </Animated.View>
          </>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
          <Animated.View
            entering={FadeInDown.delay(300).duration(1000)}
          >
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
            />
            {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}
            </Animated.View>
          </>
        )}
      />


      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => {navigation.navigate('login')}}>
        <Text style={styles.loginLink}>Already have an account? Log in</Text>
      </TouchableOpacity>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    width:'100%',
    gap:10,
    // backgroundColor:'#F5EDED'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#051d5f',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    height: 45,
    width:'80%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    height: 45,
    backgroundColor: '#4682B4',
    backgroundColor:'#006994',
    backgroundColor:'black',
    borderRadius: 20,
    width:'45%',
    marginLeft:'30%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
    marginLeft:'10%'
  },
  locationText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  loginLink: {
    color: '#4682B4',
    alignSelf: 'center',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});
