import React, { useRef } from "react";
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useMealPlan } from "../../../context/MealPlanContext";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";

const Alternatives = () => {
    const { alternatives } = useLocalSearchParams();
    
    const { updateSelectedRecipe } = useMealPlan();
    const navigation = useNavigation();
    const swipeableRefs = useRef([]);

    let alternativesData = {};
    try {
        alternativesData = typeof alternatives === "string" ? JSON.parse(alternatives) : alternatives;
    } catch (error) {
        console.error("JSON Parsing Error:", error);
    }

    // Create a list of recipes from the recipes array
    const recipesList = alternativesData?.recipes ? alternativesData.recipes.map((recipe) => ({
        label: recipe.label || "No label",
        image: recipe.image || null,
        serving: recipe.serving || "N/A",
        calories: recipe.calories || "N/A",
        ingredients: recipe.ingredients || [],
        ingredientsLines: recipe.ingredientsLines || [],
        cautions: recipe.cautions || [],
        nutrients: recipe.nutrients || [],
        id: recipe.id || "",
        score: recipe.score || "",
    })) : [];

    const handleSelectRecipe = (recipe, index) => {
        updateSelectedRecipe(alternativesData.mealType, { 
            ...recipe, 
            mealType: alternativesData.mealType 
        });

        if (swipeableRefs.current[index]) {
            swipeableRefs.current[index].close();
        }

        navigation.navigate("mealplan"); 
    };

    const renderRightActions = (progress, dragX, recipe, index) => {
        const opacity = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: "clamp",
        });

        return (
            <Animated.View style={[styles.swipeAction, { opacity }]}>
                <TouchableOpacity onPress={() => handleSelectRecipe(recipe, index)} style={styles.swipeButton}>
                    <Text style={styles.swipeText}>Select</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <FlatList
                data={recipesList}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={({ item, index }) => (
                    <Swipeable
                        ref={(ref) => (swipeableRefs.current[index] = ref)}
                        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item, index)}
                    >
                        <View style={styles.card}>
                            {item.image && <Image source={{ uri: item.image }} style={styles.foodImage} />}
                            <View style={styles.details}>
                                <Text style={styles.label}>{item.label}</Text>
                                <Text style={styles.serving}>Serving: {item.serving}</Text>
                                <Text style={styles.serving}>Calories: {item.calories}</Text>
                            </View>
                        </View>
                    </Swipeable>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No alternatives available.</Text>}
            />
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        padding: 16,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 10,
        marginVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        elevation: 3,
    },
    foodImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 10,
    },
    details: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    serving: {
        fontSize: 14,
        color: "#666",
    },
    emptyText: {
        textAlign: "center",
        fontSize: 16,
        color: "#888",
        marginTop: 20,
    },
    swipeAction: {
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        backgroundColor: "#FF7648",
        marginVertical: 8,
        borderRadius: 10,
    },
    swipeButton: {
        padding: 15,
    },
    swipeText: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
});

export default Alternatives;