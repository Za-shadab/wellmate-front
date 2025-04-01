import { Stack } from "expo-router";

export default function FoodLogStack() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: "Food Log" }} />
            <Stack.Screen name="logDetailScreen/[logDetail]" options={{ title: "Food Log Detail" }} />
            <Stack.Screen name="BarCodeDetailScreen/[barcodeDetail]" options={{ title: "Barcode Detail" }} />
        </Stack>
    );
}
