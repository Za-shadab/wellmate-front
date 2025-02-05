// import React, { useState } from "react";
// import { useForm, Controller } from "react-hook-form";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   TextInput,
//   TouchableOpacity,
//   SafeAreaView
// } from "react-native";
// import { Link, useNavigation } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import Animated, { FadeInDown } from "react-native-reanimated";
// import * as yup from 'yup'
// import { yupResolver } from '@hookform/resolvers/yup';
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";

// const LogIn = () => {
//   const [status, setStatus] = useState(null);
//   const navigation = useNavigation();

//   // Validation Schema
//   const loginSchema = yup.object().shape({
//     email: yup.string().email('Invalid email format').required('Email is required'),
//     password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
//   });

//   const { control, handleSubmit, formState: { errors } } = useForm({
//     resolver: yupResolver(loginSchema)
//   });

//   // Async login function
//   const onSubmit = async (data) => {
//     console.log(data);
//     try {
//       const response = await axios.post('http://192.168.0.140:3000/api/login', {
//         email: data.email,
//         password: data.password
//       });
      
//       console.log("Server Response:", response.data);
      
//       await AsyncStorage.setItem('token', response.data.token);
//       await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
      
//       navigation.navigate('(tabs)');
//     } catch (error) {
//       console.log("Error sending data:", error.response?.data?.msg || "Something went wrong");
//       setStatus(error.response?.data?.msg || "Login failed. Please try again.");
//     }
//   };

//   return (
//     <SafeAreaView style={styles.sfview}>
//       <View style={styles.container}>
//         <Text style={styles.title}>Login</Text>

//         {/* Email Input */}
//         <Controller
//           control={control}
//           name="email"
//           render={({ field: { onChange, onBlur, value } }) => (
//             <Animated.View entering={FadeInDown.duration(1000)}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Email"
//                 onBlur={onBlur}
//                 onChangeText={onChange}
//                 keyboardType="email-address"
//                 value={value}
//               />
//               {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
//             </Animated.View>
//           )}
//         />

//         {/* Password Input */}
//         <Controller
//           control={control}
//           name="password"
//           render={({ field: { onChange, onBlur, value } }) => (
//             <Animated.View entering={FadeInDown.duration(1000)}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Password"
//                 onBlur={onBlur}
//                 onChangeText={onChange}
//                 value={value}
//                 secureTextEntry
//               />
//               {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
//             </Animated.View>
//           )}
//         />

//         {/* Display Login Errors */}
//         {status && <Text style={styles.loginError}>{status}</Text>}

//         {/* Login Button */}
//         <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
//           <Text style={styles.buttonText}>Login</Text>
//         </TouchableOpacity>

//         <StatusBar style="auto" />

//         {/* Signup Link */}
//         <Link href={'/registration'} asChild>
//           <Pressable>
//             <Text style={styles.loginLink}>Sign Up</Text>
//           </Pressable>
//         </Link>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default LogIn;

// // Styles
// const styles = StyleSheet.create({
//   sfview: { flex: 1 },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 30,
//     textAlign: 'center',
//     lineHeight: 100
//   },
//   input: {
//     height: 45,
//     width: '70%',
//     alignSelf: "center",
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     paddingHorizontal: 18,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   button: {
//     height: 50,
//     backgroundColor: "black",
//     borderRadius: 20,
//     width: "50%",
//     marginLeft: "25%",
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   error: {
//     color: 'red',
//     fontSize: 12,
//     marginBottom: 5,
//     marginLeft: '18%'
//   },
//   loginError: {
//     textAlign: 'center',
//     color: 'red',
//     fontSize: 15
//   },
//   loginLink: {
//     alignSelf: 'center',
//     marginTop: 20,
//     fontSize: 20
//   }
// });

import { Redirect } from 'expo-router';

export default function TabIndex () {
  return <Redirect href={'/login'} />;
};