import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions
} from "react-native";
import { useNavigation } from "expo-router";
import { useRegistrationContext } from "../context/RegistrationContext";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // For 2 cards per row with spacing

const HealthConditionsScreen = () => {
    const navigation = useNavigation();
    const { registrationData, updateRegistrationData } = useRegistrationContext();
    
    const healthConditions = ["Diabetes", "Hypertension", "Thyroid", "PCOS"];
    const [selectedConditions, setSelectedConditions] = useState([]);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.95));
    
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, [fadeAnim, scaleAnim]);
    
    const toggleCondition = (condition) => {
        if (condition === "None") {
            setSelectedConditions(["None"]);
        } else {
            setSelectedConditions((prev) => {
                // If "None" is selected and user selects another condition, remove "None"
                if (prev.includes("None")) {
                    return [condition];
                }
                
                // Toggle the selected condition
                return prev.includes(condition)
                    ? prev.filter((item) => item !== condition)
                    : [...prev, condition];
            });
        }
    };
    
    const handleNext = () => {
        if (selectedConditions.length === 0) {
            alert("Please select at least one health condition or choose 'None'.");
            return;
        }
        if(selectedConditions.includes("None")){
          navigation.navigate('selectgoal')
        }else{
          navigation.navigate("healthDetail");
        }
        console.log(".....................",selectedConditions.includes("None"));
        updateRegistrationData("healthConditions", selectedConditions);
    };
    
    const renderConditionCard = (condition, index) => {
        const isSelected = selectedConditions.includes(condition);
        const isNone = condition === "None";
        
        // Calculate animation delay based on index
        const animationDelay = index * 100;
        
        return (
            <Animated.View 
                key={index}
                style={[
                    { 
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                        // Add a slight delay for each card
                        animationDelay: animationDelay
                    }
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.conditionCard,
                        isSelected && styles.selectedCard,
                        isNone && styles.noneCard,
                        isNone && isSelected && styles.selectedNoneCard
                    ]}
                    onPress={() => toggleCondition(condition)}
                    activeOpacity={0.7}
                >
                    {isSelected && (
                        <View style={styles.checkIconContainer}>
                            <FontAwesome6 name="check" size={12} color="white" />
                        </View>
                    )}
                    
                    <View style={styles.conditionIconContainer}>
                        <FontAwesome6 
                            name={getIconForCondition(condition)} 
                            size={24} 
                            color={isSelected ? "#fff" : "#4A6DA7"} 
                        />
                    </View>
                    
                    <Text style={[
                        styles.conditionText, 
                        isSelected && styles.selectedConditionText
                    ]}>
                        {condition}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };
    
    // Helper function to get appropriate icon for each condition
    const getIconForCondition = (condition) => {
        switch(condition) {
            case "Diabetes":
                return "droplet";
            case "Hypertension":
                return "heart-pulse";
            case "Thyroid":
                return "neck";
            case "PCOS":
                return "venus";
            case "Heart Disease":
                return "heart";
            case "None":
                return "check-double";
            default:
                return "notes-medical";
        }
    };
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
            <ScrollView 
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Health Profile</Text>
                    <Text style={styles.subtitle}>
                        Select any health conditions you have so we can customize your nutrition plan.
                    </Text>
                </View>
                
                <View style={styles.cardsContainer}>
                    {healthConditions.map((condition, index) => (
                        renderConditionCard(condition, index)
                    ))}
                    {renderConditionCard("None", healthConditions.length)}
                </View>
                
                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        selectedConditions.length === 0 && styles.disabledButton
                    ]}
                    onPress={handleNext}
                    disabled={selectedConditions.length === 0}
                    activeOpacity={0.8}
                >
                    <Text style={styles.nextButtonText}>Continue</Text>
                    <FontAwesome6 name="arrow-right" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 30,
    },
    progressContainer: {
        marginBottom: 24,
    },
    progressBar: {
        height: 6,
        backgroundColor: "#E2E8F0",
        borderRadius: 3,
        marginBottom: 8,
    },
    progressFill: {
        width: "40%", // Adjust based on actual progress (2/5 = 40%)
        height: 6,
        backgroundColor: "#4A6DA7",
        borderRadius: 3,
    },
    progressText: {
        fontSize: 14,
        color: "#718096",
        fontWeight: "500",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 12,
        color: "#1A202C",
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
        color: "#718096",
    },
    cardsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    conditionCard: {
        width: cardWidth,
        height: 120,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        position: "relative",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    selectedCard: {
        backgroundColor: "#4A6DA7",
        borderColor: "#4A6DA7",
    },
    noneCard: {
        backgroundColor: "#F7FAFC",
        borderStyle: "dashed",
    },
    selectedNoneCard: {
        backgroundColor: "#4A6DA7",
        borderStyle: "solid",
    },
    checkIconContainer: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    conditionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#F0F5FF",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    conditionText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2D3748",
        textAlign: "center",
    },
    selectedConditionText: {
        color: "#FFFFFF",
    },
    nextButton: {
        backgroundColor: "#4A6DA7",
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#4A6DA7",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: "#CBD5E0",
        shadowOpacity: 0,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginRight: 8,
    },
    buttonIcon: {
        marginLeft: 4,
    },
});

export default HealthConditionsScreen;