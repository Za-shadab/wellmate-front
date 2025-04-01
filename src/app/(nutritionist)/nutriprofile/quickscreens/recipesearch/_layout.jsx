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
            <Stack.Screen name="[recipeDetail]" options={{headerShown: false}}/>
            <Stack.Screen name="collectionModal" options={{headerShown: false}}/>
        </Stack> 
        </GestureHandlerRootView>
    )
}

export default QuickScreens