import { Stack } from "expo-router";

export default function savedplannerLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }} initialRouteName="createsavedplan">
            <Stack.Screen name="savedplans" options={{ title: "savedPlans Home" }} />
            <Stack.Screen name="createsavedplan" options={{ title: "savedPlans Generator" }} />
            <Stack.Screen name="[alternateRecipe]" options={{ title: "savedPlans Generator" }} />
        </Stack>
    );
}
