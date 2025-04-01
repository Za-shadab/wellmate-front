import { Stack } from "expo-router";

export default function FoodLogStack() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: "Meal Plan" }} />
            <Stack.Screen name="Alter/[alternative]" options={{ title: "Food Log Detail" }} />
        </Stack>
    );
}
