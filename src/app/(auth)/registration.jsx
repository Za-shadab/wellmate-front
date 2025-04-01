import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image, Pressable, ScrollView, StatusBar, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import uselocation from '../../hooks/uselocation';
import Animated, { FadeInDown, BounceOut, BounceInUp } from 'react-native-reanimated';
import { Link } from 'expo-router'
import axios from 'axios'
import { useNavigation } from 'expo-router';
import { useRegistrationContext } from '../context/RegistrationContext';
import { useuserDetailContext } from '../context/UserDetailContext';
import { useNutritionistDetailContext } from '../context/NutritionistContext'
import { URL } from '../../constants/url'
import { Feather } from '@expo/vector-icons'; // Changed to Feather icons for a cleaner look

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
  const { registrationData, updateRegistrationData } = useRegistrationContext({});
  const { userDetail, updateUserDetail } = useuserDetailContext({});
  const { nutritionistDetail, updateNutritionistDetail } = useNutritionistDetailContext({});
  const [userType, setUserType] = useState('regular_user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    console.log("Context Information....................................", registrationData);
    console.log("User Informaton.........................................", userDetail);
    console.log("nutri Informaton.........................................", nutritionistDetail);
  }, [registrationData, userDetail])

  const onSubmit = data => {
    data.location = address;
    data.role = userType
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
      location: address || 'India',
      role: data.role
    }
    console.log("Payload", payload);

    (async () => {
      try {
        if (!payload.location || !payload.email || !payload.name || !payload.password || !payload.password) return
        const response = await axios.post(`${URL}/api/register`, payload);
        const userId = response.data.userId
        if (response.data.requiresVerification) {
          // Navigate to OTP verification screen
          navigation.navigate('OTPVerification', { 
            email: data.email 
          });
        }else{
          if (userType === 'regular_user') {
            updateUserDetail('userId', userId);
            navigation.navigate('(onboard)');
          }
          if (userType === 'nutri_user') {
            updateNutritionistDetail('userId', userId);
            navigation.navigate('(nutrionboard)');
          }
        }
      } catch (err) {
        console.log('error sending data', err.message);
      }
    })()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={[styles.radioButton, userType === 'regular_user' && styles.selectedRadio]}
          onPress={() => setUserType('regular_user')}
        >
          <View style={[styles.innerCircle, userType === 'regular_user' && styles.filledCircle]} />
          <Text style={styles.radioText}>Regular User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.radioButton, userType === 'nutri_user' && styles.selectedRadio]}
          onPress={() => setUserType('nutri_user')}
        >
          <View style={[styles.innerCircle, userType === 'nutri_user' && styles.filledCircle]} />
          <Text style={styles.radioText}>Nutritionist User</Text>
        </TouchableOpacity>
      </View>
      {errors.role && <Text style={styles.error}>{errors.role.message}</Text>}

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
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIconContainer} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#006994" 
                  />
                </TouchableOpacity>
              </View>
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
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm Password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIconContainer} 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Feather 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#006994" 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}
            </Animated.View>
          </>
        )}
      />


      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { navigation.navigate('login') }}>
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
    width: '100%',
    gap: 10,
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
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  passwordContainer: {
    flexDirection: 'row',
    width: '80%',
    height: 45,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 18,
  },
  eyeIconContainer: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    height: 45,
    backgroundColor: '#4682B4',
    backgroundColor: '#006994',
    backgroundColor: 'black',
    borderRadius: 20,
    width: '45%',
    marginLeft: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 10,
  },
  selectedRadio: {
    borderColor: '#006994',
  },
  innerCircle: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#006994',
    marginRight: 8,
  },
  filledCircle: {
    backgroundColor: '#006994',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
    marginLeft: '10%'
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