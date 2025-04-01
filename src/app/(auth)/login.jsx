import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Platform,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions
} from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn
} from "react-native-reanimated";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "expo-router";
import { useuserDetailContext } from '../context/UserDetailContext';
import { useNutritionistDetailContext } from "../context/NutritionistContext";
import { useClientUserContext } from "../context/ClientUserContext";
import { URL } from '../../constants/url';
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

const LogIn = () => {
  const loginSchema = yup.object().shape({
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string().min(8).required('Password is required'),
  });

  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { userDetail, updateUserDetail } = useuserDetailContext();
  const { nutritionistDetail, updateNutritionistDetail } = useNutritionistDetailContext({});
  const { clientUser, updateClientUser } = useClientUserContext();
  const navigation = useNavigation();
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = data => {
    setIsLoading(true);
    setStatus('');
    
    const userData = {
      email: data.email,
      password: data.password
    };

    (async() => { 
      try {
        const response = await axios.post(`${URL}/api/login`, userData);

        if (response.data.NutritionistId) {
          console.log("server response in nutritionist:", response.data); 
          AsyncStorage.setItem('token', response.data.token);
          AsyncStorage.setItem('userType', 'nutritionist');
          AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
          navigation.navigate('(nutritionist)');
          console.log("Response data userId",response.data);
          
          updateNutritionistDetail('userId', response.data.userId);
          updateNutritionistDetail('nutritionistId', response.data.NutritionistId);
          updateNutritionistDetail('profileUrl', response.data.brandprofileUrl);
          updateNutritionistDetail('name', response.data.name);
        }
        
        if (response.data.regularId) {
          const userId = response.data.userId;
          console.log("server response:", response.data); 
          AsyncStorage.setItem('token', response.data.token);
          AsyncStorage.setItem('userType', 'regularuser');
          AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
          navigation.navigate('(tabs)');
          updateUserDetail('userId', userId);
          updateUserDetail('regularId', response.data.regularId);
          updateUserDetail('profileUrl', response.data.profileUrl);
          updateUserDetail('name', response.data.name);
        }

        if(response.data.ClientId){
          console.log("server response in client:", response.data); 
          AsyncStorage.setItem('token', response.data.token);
          AsyncStorage.setItem('userType', 'clientuser');
          AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
          navigation.navigate('(client)');
          updateClientUser('clientUserId', response.data.userId);
          updateClientUser('clientName', response.data.name);
          updateClientUser('clientProfileUrl', response.data.profileUrl);
          updateClientUser('clientId', response.data.ClientId);
          updateClientUser('nutritionistId', response.data.nutritionistId);
        }
      } catch (error) {
        console.log("Error sending data:", error.response?.data?.msg || error.message);
        setStatus(error.response?.data?.msg || "Login failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    })();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <Animated.View 
        style={styles.headerContainer}
        entering={FadeIn.duration(800)}
      >
        <Animated.Image 
          source={require('../../../assets/images/splash-icon.png')} 
          style={styles.logo}
          entering={ZoomIn.duration(1000)}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View 
        style={styles.formContainer}
        entering={FadeInDown.duration(800).delay(200)}
      >
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.inputContainer}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Animated.View 
                style={styles.inputWrapper}
                entering={FadeInDown.duration(800).delay(400)}
              >
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Enter your email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  value={value}
                  autoCapitalize="none"
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </Animated.View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Animated.View 
                style={styles.inputWrapper}
                entering={FadeInDown.duration(800).delay(600)}
              >
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Feather 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                )}
              </Animated.View>
            )}
          />
        </View>

        <Animated.View 
          entering={FadeInDown.duration(800).delay(700)}
          style={styles.forgotPasswordContainer}
        >
          <TouchableOpacity>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </Animated.View>

        {status ? (
          <Animated.View 
            entering={FadeInDown.duration(400)}
            style={styles.statusContainer}
          >
            <Text style={styles.statusText}>{status}</Text>
          </Animated.View>
        ) : null}

        <Animated.View 
          entering={FadeInDown.duration(800).delay(800)}
          style={styles.buttonContainer}
        >
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.duration(800).delay(900)}
          style={styles.signupContainer}
        >
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Link href={'/registration'} asChild>
            <Pressable>
              <Text style={styles.signupLink}>Sign Up</Text>
            </Pressable>
          </Link>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default LogIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign:'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign:'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    height: 56,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputError: {
    borderColor: '#ff5252',
  },
  errorText: {
    color: '#ff5252',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#4a6ee0',
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  button: {
    height: 56,
    backgroundColor: '#4a6ee0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4a6ee0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a6ee0',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 56,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordToggle: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});