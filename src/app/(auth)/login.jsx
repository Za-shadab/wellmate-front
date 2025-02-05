import React, { useState } from "react";
import { useForm, Controller, set } from "react-hook-form";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Platform,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView
} from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, {
  FadeInDown,
  BounceOut,
  BounceInUp,
} from "react-native-reanimated";
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "expo-router";

const LogIn = () => {

  const loginSchema = yup.object().shape({
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string().min(8).required('Password is required'),
  })
  const[status, setstatus] = useState();
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver:yupResolver(loginSchema)
  });

  const onSubmit = data => {
    const userData = {
      email: data.email,
      password: data.password
    }
    console.log(userData);

    (async()=>{ 
      try {
          const response= await axios.post('http://192.168.3.17:3000/api/login', userData);
          console.log("server response:", response.data); 
          AsyncStorage.setItem('token', response.data.token);
          AsyncStorage.setItem('isLoggedIn', JSON.stringify(true))
          navigation.navigate('(tabs)')
        } catch (error) {
          console.log("Error sending data:", error.response.data.msg);
          setstatus(error.response.data.msg)
        }
        })()
    };

  return (

    <SafeAreaView style={styles.sfview}>
    <View style={styles.container}>

    <Text style={styles.title}>Login</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <Animated.View entering={FadeInDown.duration(1000)}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                onBlur={onBlur}
                onChangeText={onChange}
                keyboardType="email-address"
                value={value}
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
            <Animated.View entering={FadeInDown.duration(1000)}>
              <TextInput
                style={styles.input}
                placeholder="password"
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

      <Text style={styles.loginerr}>{status}</Text>

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    
    <Link href={'/registration'} asChild>
      <Pressable>
        <Text style={styles.loginLink}>Sign Up</Text>
      </Pressable>
    </Link>
    </View>
    </SafeAreaView>
    // {/* </KeyboardAvoidingView> */}
  );
};

export default LogIn;

const styles = StyleSheet.create({
  sfview:{
    flex:1,
  },
  container:{
    flex:1,
    justifyContent:'center',
    // backgroundColor:'#F8F6E3'
  },
  title:{
    fontSize:30,
    textAlign:'center',
    lineHeight:100
  },
  input: {
    height:45,
    width:'70%',
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    height: 50,
    backgroundColor: "black",
    borderRadius: 20,
    width: "50%",
    marginLeft: "25%",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
    marginLeft:'18%'
  },
  loginLink: {
    alignSelf: 'center',
    marginTop: 20,
    fontSize: 20
  },
  loginerr:{
    textAlign:'center',
    color:'red',
    fontSize: 15
  }
});
