import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function NutritionistDashboard(){
    return(
        <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
            <Stack.Screen name="clmanagement" options={{headerShown: false}}/>
            <Stack.Screen name="notification" options={{headerShown: false}}/>
        </Stack> 
        </GestureHandlerRootView>
    )
}

export default NutritionistDashboard