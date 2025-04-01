import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { UserDetailProvider } from '../context/UserDetailContext';


function OnboardLayout(){
    return(
        <Stack
            initialRouteName='ageselect'
        >
            <Stack.Screen name="ageselect" options={{headerShown: false}}/>
            <Stack.Screen name="selectgoal" options={{headerShown: false}}/>
            <Stack.Screen name="selectweight" options={{headerShown: false}}/>
            <Stack.Screen name="activitylevel" options={{headerShown: false}}/>
            <Stack.Screen name="preference" options={{headerShown: false}}/>
            <Stack.Screen name="allergens" options={{headerShown: false}}/>
            <Stack.Screen name="profilePicker" options={{headerShown: false}}/>
            <Stack.Screen name="dashboard" options={{headerShown: false}}/>
        </Stack> 
    )
}

export default OnboardLayout