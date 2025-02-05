import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Feather"; // Import Feather icons
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
  const { registrationData, updateRegistrationData } = useRegistrationContext({});
  const navigationNext = useNavigation();

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
    navigationNext.navigate('profilePicker');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Your Allergies</Text>
      <FlatList
        data={allergies}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleSelection(item.name)} style={styles.item}>
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  selectedAllergies.includes(item.name) && styles.checkboxSelected,
                ]}
              >
                {selectedAllergies.includes(item.name) && (
                  <Icon name="check" size={16} color="#fff" />
                )}
              </View>
              <View>
                <Text style={styles.allergyName}>{item.name}</Text>
                <Text style={styles.allergyDesc}>{item.desc}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, selectedAllergies.length === 0 && styles.disabledButton]}
        onPress={handleNext}
        disabled={selectedAllergies.length === 0}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#fff",
  },
  checkboxSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  allergyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  allergyDesc: {
    fontSize: 13,
    color: "#666",
  },
  nextButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
};

export default AllergySelection;
