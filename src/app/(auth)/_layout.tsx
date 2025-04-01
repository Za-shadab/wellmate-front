import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';



function AuthLayout(){
    return(
            <Stack>
                <Stack.Screen name="index" options={{headerShown: false}}/>
                <Stack.Screen name="login" options={{headerShown: false}}/>
                <Stack.Screen name="registration" options={{headerShown: false}}/>
                <Stack.Screen name="OTPVerification" options={{headerShown: false}}/>
            </Stack>
    )
}

export default AuthLayout