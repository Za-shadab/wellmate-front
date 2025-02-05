import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  Image
} from 'react-native';
import { useNavigation } from 'expo-router';
import { useRegistrationContext } from '../context/RegistrationContext';
import Progressbar from '../../components/progressbar';


const DietaryPreferencesScreen = () => {
  const [selectedPreference, setSelectedPreference] = useState(null);
  const { registrationData, updateRegistrationData } = useRegistrationContext({});
  const navigation = useNavigation();


  const preferences = [
    { id: 1, label: 'No Preference', img: require('../../../assets/images/dish.png') },
    { id: 2, label: 'Vegetarian', img: require('../../../assets/images/dish.png') },
    { id: 3, label: 'Keto friendly', img: require('../../../assets/images/dish.png') },
    { id: 4, label: 'Mediterranean', img: require('../../../assets/images/dish.png') },
    { id: 5, label: 'Paleo', img: require('../../../assets/images/dish.png') },
    { id: 6, label: 'Pescatarian', img: require('../../../assets/images/dish.png') },
    { id: 7, label: 'Crustacean free', img: require('../../../assets/images/dish.png') }
  ];

  const handleSelect = (label) => {
    setSelectedPreference(label);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}

      {/* Title and Subtitle */}
      <View style={styles.header}>
        <Text style={styles.title}>Tell us about what you eat?</Text>
        <Text style={styles.subtitle}>
          Let us know what your current dietary preferences are.
        </Text>
        <View style={styles.progressBarContainer}>
      </View>
      </View>

      {/* List of Preferences */}
      <FlatList
        data={preferences}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.preferenceItem,
              selectedPreference === item.id && styles.selectedItem,
            ]}
            onPress={() => handleSelect(item.label)}
          >
            <Image
              source={item.img}
              style={styles.preference}
            />

            <Text
              style={[
                styles.preferenceText,
                selectedPreference === item.label && styles.selectedText,
              ]}
            >
              {item.label}
            </Text>

            <View style={styles.radiobutton}>
              {
                selectedPreference === item.label && <View style={styles.selectedradioButton}></View>
              }
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Next Button */}
      <TouchableOpacity
        style={[
          styles.nextButton,
          !selectedPreference && styles.disabledButton,
        ]}
        disabled={!selectedPreference}
        onPress={() => {
          console.log('Selected Preference:', selectedPreference);
          // navigation.navigate('profilePicker')
          updateRegistrationData('dietType', selectedPreference);
          navigation.navigate('allergens')
        }}
      ><Text
          style={styles.nextButtonText}
        >Next</Text>
      </TouchableOpacity>

      {/* Footer Note */}
      <Text style={styles.footerNote}>
        We will never share your personal information with anyone.
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginRight: 10,
  },
  progressFill: {
    width: '40%',
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#4A5568',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 22,
  },
  preferenceItem: {
    // backgroundColor: '#F7FAFC',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    gap:15
  },
  radiobutton:{
    width:20,
    height:20,
    borderColor:'#E2E8F9',
    borderWidth:1,
    borderRadius:10,
    marginLeft:'auto',
    marginRight:0
  },
  selectedradioButton:{
    width:15, 
    height:15, 
    borderRadius:9, 
    margin:'auto', 
    backgroundColor:'#4A90E2'
  },
  selectedItem: {
    // backgroundColor: '#E6F6FF',
    borderColor: '#4A90E2',
  },
  preferenceText: {
    fontSize: 16,
    color: '#4A5568',
  },
  preference:{
    width:30,
    aspectRatio:1
  },
  selectedText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#4A90E2',  // Prominent blue color
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    elevation: 4,  // Added shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
  },
  nextButtonText: {
    fontSize: 18,  // Slightly bigger to make it more clickable
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  footerNote: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default DietaryPreferencesScreen;
