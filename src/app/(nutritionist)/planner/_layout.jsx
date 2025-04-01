import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";

function AlternateRecipesStack(){
    return(
        <Stack screenOptions={{headerShown:false}}/>
    )
}

export default AlternateRecipesStack