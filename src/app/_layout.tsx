import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, StackActions} from '@react-navigation/native';
import { useColorScheme } from '@/src/components/useColorScheme';
import { boolean } from 'yup';
import { RegistrationProvider } from './context/RegistrationContext';
import { UserDetailProvider } from './context/UserDetailContext';
import {NutritionistDetailProvider} from './context/NutritionistContext';
import {ClientUserProvider} from './context/ClientUserContext';
import { ClientRegistrationProvider } from './context/ClientRegistration';
import {SavedPlanProvider} from '@/src/app/context/savedPlanContext'
import { MealPlanProvider } from './context/MealPlanContext';


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: '(tabs)',
// };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}


function RootLayoutNav() {
  const colorScheme = useColorScheme();
  return (
    <RegistrationProvider>
    <UserDetailProvider>
    <NutritionistDetailProvider>
    <ClientUserProvider>
    <ClientRegistrationProvider>
    <SavedPlanProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <MealPlanProvider>
      <Stack>
        <Stack.Screen name="index" options={{headerShown: false}}/>
        <Stack.Screen name="(sliders)" options={{headerShown: false}}/>
        <Stack.Screen name="(auth)" options={{headerShown: false}}/>
        <Stack.Screen name="(onboard)" options={{headerShown: false}}/>
        <Stack.Screen name="(nutrionboard)" options={{headerShown: false}}/>
        <Stack.Screen name="(nutritionist)" options={{headerShown: false}}/>
        <Stack.Screen name="(clientonboard)" options={{headerShown: false}}/>
        <Stack.Screen name="(nutritionclient)" options={{headerShown: false}}/>
        <Stack.Screen name="(clientProfile)" options={{headerShown: false}}/>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(client)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      </MealPlanProvider>
    </ThemeProvider>
    </SavedPlanProvider>
    </ClientRegistrationProvider>
    </ClientUserProvider>
    </NutritionistDetailProvider>
    </UserDetailProvider>
    </RegistrationProvider>
  );
}
