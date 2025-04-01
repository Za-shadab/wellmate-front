import { Stack } from "expo-router";

export default function ProfileStack() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: "Meal Plan", headerShown:false }} />
            <Stack.Screen name="wearablesInsights" options={{ title: "Wearables", headerShown:false }} />
        </Stack>
    );
}
