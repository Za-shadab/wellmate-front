import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  Animated
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useRegistrationContext } from "../context/RegistrationContext";
import { useNavigation } from "expo-router";

const allergies = [
  { name: "Celery-free", desc: "Avoids celery and celery-based products." },
  { name: "Dairy-free", desc: "Excludes milk, cheese, and dairy products." },
  { name: "Egg-free", desc: "Avoids eggs and egg-based ingredients." },
  { name: "low-sugar", desc: "Excludes high sugar foods"},
  { name: "Crustacean-free", desc: "Avoids crabs, lobsters, and shrimp." },
  { name: "Fish-free", desc: "Excludes all types of fish." },
  { name: "Gluten-free", desc: "No wheat, barley, rye, or gluten." },
  { name: "Lupine-free", desc: "Avoids lupine flour and seeds." },
  { name: "Mollusk-free", desc: "Excludes clams, mussels, and oysters." },
  { name: "Mustard-free", desc: "No mustard seeds or mustard-based products." },
  { name: "Peanut-free", desc: "Excludes peanuts and peanut derivatives." },
  { name: "Sesame-free", desc: "Avoids sesame seeds and sesame oil." },
  { name: "Shellfish-free", desc: "Excludes shrimp, crabs, and lobsters." },
  { name: "Soy-free", desc: "Avoids soybeans and soy-based products." },
  { name: "Sulfite-free", desc: "No sulfite preservatives in food." },
  { name: "Tree-nut-free", desc: "Avoids almonds, walnuts, and other tree nuts." },
  { name: "Wheat-free", desc: "Excludes wheat and wheat-based products." },
];

const AllergySelection = ({ navigation }) => {
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const { registrationData, updateRegistrationData } = useRegistrationContext({});
  const navigationNext = useNavigation();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleSelection = (allergy) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((item) => item !== allergy)
        : [...prev, allergy]
    );
  };

  const handleNext = () => {
    console.log("Selected Allergies:", selectedAllergies);
    updateRegistrationData('allergens', selectedAllergies);
    navigationNext.navigate('permission');
  };

  const renderItem = ({ item, index }) => {
    const isSelected = selectedAllergies.includes(item.name);
    
    return (
      <Animated.View 
        style={[
          { opacity: fadeAnim },
          { transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
          })}] }
        ]}
      >
        <TouchableOpacity 
          onPress={() => toggleSelection(item.name)} 
          style={[
            styles.item,
            index === 0 && styles.firstItem,
            index === allergies.length - 1 && styles.lastItem,
            isSelected && styles.selectedItem
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.checkboxContainer}>
            <View
              style={[
                styles.checkbox,
                isSelected && styles.checkboxSelected,
              ]}
            >
              {isSelected && (
                <Icon name="check" size={16} color="#fff" />
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.allergyName}>{item.name}</Text>
              <Text style={styles.allergyDesc}>{item.desc}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Dietary Restrictions</Text>
          <Text style={styles.subheader}>
            Select any allergies or dietary restrictions you have
          </Text>
          <View style={styles.selectedCount}>
            <Text style={styles.selectedCountText}>
              {selectedAllergies.length} selected
            </Text>
          </View>
        </View>
        
        <FlatList
          data={allergies}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
        
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedAllergies.length === 0 && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={selectedAllergies.length === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <Icon name="arrow-right" size={20} color="#fff" style={styles.nextButtonIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    marginBottom: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
    lineHeight: 22,
  },
  selectedCount: {
    marginTop: 8,
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a6da7",
  },
  listContainer: {
    paddingBottom: 20,
  },
  item: {
    padding: 16,
    backgroundColor: "#fff",
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  firstItem: {
    marginTop: 0,
  },
  lastItem: {
    marginBottom: 0,
  },
  selectedItem: {
    backgroundColor: "#f0f5ff",
    borderColor: "#4a6da7",
    borderWidth: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#d1d1d1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "#fff",
  },
  checkboxSelected: {
    backgroundColor: "#4a6da7",
    borderColor: "#4a6da7",
  },
  allergyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  allergyDesc: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  nextButton: {
    marginTop: 16,
    backgroundColor: "#4a6da7",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#4a6da7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: "#c5c5c5",
    shadowOpacity: 0,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  nextButtonIcon: {
    marginLeft: 8,
  },
});

export default AllergySelection;