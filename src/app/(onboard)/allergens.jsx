import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
  TextInput,
  Animated,
  StatusBar
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useRegistrationContext } from "../context/RegistrationContext";
import { useNavigation } from "expo-router";

const allergies = [
  { name: "Celery-free", desc: "Avoids celery and celery-based products." },
  { name: "Crustacean-free", desc: "Avoids crabs, lobsters, and shrimp." },
  { name: "Dairy-free", desc: "Excludes milk, cheese, and dairy products." },
  { name: "Egg-free", desc: "Avoids eggs and egg-based ingredients." },
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
  const [searchQuery, setSearchQuery] = useState("");
  const { registrationData, updateRegistrationData } = useRegistrationContext({});
  const navigationNext = useNavigation();
  const [scaleAnim] = useState(new Animated.Value(1));

  // Filter allergies based on search query
  const filteredAllergies = allergies.filter(
    (allergy) => 
      allergy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allergy.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = useCallback((allergy) => {
    // Animate the scale when toggling
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((item) => item !== allergy)
        : [...prev, allergy]
    );
  }, [scaleAnim]);

  const handleNext = () => {
    console.log("Selected Allergies:", selectedAllergies);
    updateRegistrationData('allergens', selectedAllergies);
    navigationNext.navigate('profilePicker');
  };

  const clearAllSelections = () => {
    setSelectedAllergies([]);
  };

  const selectAllAllergies = () => {
    setSelectedAllergies(allergies.map(item => item.name));
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedAllergies.includes(item.name);
    
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity 
          onPress={() => toggleSelection(item.name)} 
          style={[styles.item, isSelected && styles.selectedItem]}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel={`${item.name}. ${item.desc}`}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isSelected }}
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
          <Text style={styles.header}>Select Your Allergies</Text>
          <Text style={styles.subheader}>
            We'll customize your meal recommendations based on your selections
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search allergies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.selectionControls}>
          <Text style={styles.selectedCount}>
            {selectedAllergies.length} selected
          </Text>
          <View style={styles.controlButtons}>
            <TouchableOpacity onPress={clearAllSelections} style={styles.controlButton}>
              <Text style={styles.controlButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={selectAllAllergies} style={styles.controlButton}>
              <Text style={styles.controlButtonText}>Select All</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filteredAllergies}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        <TouchableOpacity
          style={[styles.nextButton, selectedAllergies.length === 0 && styles.disabledButton]}
          onPress={handleNext}
          disabled={selectedAllergies.length === 0}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel="Continue to next step"
          accessibilityRole="button"
          accessibilityState={{ disabled: selectedAllergies.length === 0 }}
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
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  selectionControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  selectedCount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
  },
  controlButtons: {
    flexDirection: "row",
  },
  controlButton: {
    marginLeft: 15,
  },
  controlButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedItem: {
    backgroundColor: "#f0f7ff",
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    backgroundColor: "#fff",
  },
  checkboxSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  textContainer: {
    flex: 1,
  },
  allergyName: {
    fontSize: 17,
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: "#ccc",
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