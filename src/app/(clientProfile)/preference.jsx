import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  StatusBar
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
    { id: 7, label: 'Crustacean free', img: require('../../../assets/images/dish.png') },
  ];

  const handleSelect = (label) => {
    setSelectedPreference(label);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Tell us about what you eat?</Text>
        <Text style={styles.subtitle}>
          Let us know what your current dietary preferences are.
        </Text>
        <View style={styles.progressBarContainer}>
          {/* Progress bar component would go here */}
        </View>
      </View>

      {/* List of Preferences */}
      <FlatList
        data={preferences}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.preferenceItem,
              selectedPreference === item.label && styles.selectedItem,
            ]}
            onPress={() => handleSelect(item.label)}
            activeOpacity={0.7}
          >
            <View style={styles.preferenceIconContainer}>
              <Image
                source={item.img}
                style={styles.preferenceIcon}
              />
            </View>

            <Text
              style={[
                styles.preferenceText,
                selectedPreference === item.label && styles.selectedText,
              ]}
            >
              {item.label}
            </Text>

            <View style={[
              styles.radioButton,
              selectedPreference === item.label && styles.selectedRadioButtonBorder
            ]}>
              {selectedPreference === item.label && 
                <View style={styles.selectedRadioButtonDot}></View>
              }
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedPreference && styles.disabledButton,
          ]}
          disabled={!selectedPreference}
          onPress={() => {
            console.log('Selected Preference:', selectedPreference);
            updateRegistrationData('dietType', selectedPreference);
            navigation.navigate('allergens');
          }}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>

        {/* Footer Note */}
        <Text style={styles.footerNote}>
          We will never share your personal information with anyone.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  progressBarContainer: {
    marginTop: 24,
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 16,
  },
  preferenceItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
    backgroundColor: '#FAFAFA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedItem: {
    borderColor: '#4A90E2',
    backgroundColor: '#F0F7FF',
    shadowColor: '#4A90E2',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  preferenceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  preferenceIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  preferenceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A5568',
    flex: 1,
  },
  selectedText: {
    color: '#2B6CB0',
    fontWeight: '600',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioButtonBorder: {
    borderColor: '#4A90E2',
  },
  selectedRadioButtonDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A90E2',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
  },
  nextButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0.1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  footerNote: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 16,
    letterSpacing: 0.2,
  },
});

export default DietaryPreferencesScreen;