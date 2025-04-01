import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Tabs } from 'expo-router';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function QuickScreens(){
    return(
        <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
            <Stack.Screen name="discover" options={{headerShown: false}}/>
            <Stack.Screen name="recipesearch" options={{headerShown: false}}/>
            <Stack.Screen name="collections" options={{headerShown: false}}/>
            <Stack.Screen name="collectiondetail" options={{headerShown: false}}/>
            <Stack.Screen name="subscriptions" options={{headerShown: false}}/>
        </Stack> 
        </GestureHandlerRootView>
    )
}

export default QuickScreens