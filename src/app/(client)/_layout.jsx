import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TabBar from '../../components/clTabBar';

function clientSideRootLayout(){
    return(
        <GestureHandlerRootView style={{ flex: 1 }}>
        <Tabs
        options={{headerShown: false}}
        tabBar = {props => <TabBar {...props}/>}
        >
            <Tabs.Screen name="MealPlan" options={{headerShown: false}}/>
            <Tabs.Screen name="Reports" options={{headerShown: false}}/>
            <Tabs.Screen name="profile" options={{headerShown: false}}/>
        </Tabs> 
        </GestureHandlerRootView>
    )
}

export default clientSideRootLayout