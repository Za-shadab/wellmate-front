import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import {NutriRegistrationProvider} from '../context/NutriRegistration';
import {NutritionistDetailProvider} from '../context/NutritionistContext';
import {Toaster} from 'sonner-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler';


function OnboardLayout(){
    return(
        <NutriRegistrationProvider>
            <NutritionistDetailProvider>
                <GestureHandlerRootView>
                <Stack
                    initialRouteName='carousal'
                >
                    <Stack.Screen name="carousal" options={{headerShown: false}}/>
                    <Stack.Screen name="branding" options={{headerShown: false}}/>
                    <Stack.Screen name="paymentscreen" options={{headerShown: false}}/>
                    <Stack.Screen name="credentials" options={{headerShown: false}}/>
                </Stack>
                <Toaster/>
                </GestureHandlerRootView>
            </NutritionistDetailProvider>
        </NutriRegistrationProvider> 
    )
}

export default OnboardLayout