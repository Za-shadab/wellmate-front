import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { UserDetailProvider } from '../context/UserDetailContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TabBar from '@/src/components/NuTabBar';

function OnboardLayout(){
    return(
        <GestureHandlerRootView style={{ flex: 1 }}>
        <Tabs
            tabBar = {props => <TabBar {...props}/>}
        >
            <Tabs.Screen name="dashboard" options={{headerShown: false}}/>
            <Tabs.Screen name="planner" options={{headerShown: false}}/>
            <Tabs.Screen name="savedplanner" options={{headerShown: false}}/>
            <Tabs.Screen name="nutriprofile" options={{headerShown: false}}/>
        </Tabs> 
        </GestureHandlerRootView>
    )
}

export default OnboardLayout