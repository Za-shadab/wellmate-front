import { Stack } from "expo-router";

function clientalternateRecipes(){
    return(
        <Stack initialRouteName="clientdashboard">
            <Stack.Screen name="clientdashboard" options={{headerShown: false}}/>
            <Stack.Screen name="[alternateRecipes]" options={{headerShown: false}}/>
        </Stack> 
    )
}

export default clientalternateRecipes