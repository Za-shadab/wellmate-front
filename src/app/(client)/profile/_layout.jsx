import { Stack } from "expo-router";

function clientprofileRootLayout(){
    return(
        <Stack initialRouteName="profile">
            <Stack.Screen name="profile" options={{headerShown: false}}/>
        </Stack> 
    )
}

export default clientprofileRootLayout