import { Stack } from "expo-router";

export default function WearableInsightStack() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="heart" />
            <Stack.Screen name="glucose" />
            <Stack.Screen name="steps" />
            <Stack.Screen name="progress" />
            <Stack.Screen name="goals" />
            <Stack.Screen name="discover" />
            <Stack.Screen name="[recipedetail]" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="notification" />
        </Stack>
    );
}
