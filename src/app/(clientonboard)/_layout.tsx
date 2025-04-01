import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ClientRegistrationProvider } from '../context/ClientRegistration';


function ClientOnboardLayout(){
    return(
        <ClientRegistrationProvider>
            <Stack
                initialRouteName='create'
            >
                <Stack.Screen name="create" options={{headerShown: false}}/>
            </Stack>
        </ClientRegistrationProvider> 
    )
}

export default ClientOnboardLayout