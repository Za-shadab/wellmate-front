import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';
import { useNavigation } from 'expo-router';
import { useRegistrationContext } from '../context/RegistrationContext';
import Progressbar from '../../components/progressbar';

// Get screen dimensions for responsive design
const { width } = Dimensions.get('window');

const DietaryPreferencesScreen = () => {
  const [selectedPreference, setSelectedPreference] = useState(null);
  const { registrationData, updateRegistrationData } = useRegistrationContext({});
  const navigation = useNavigation();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(0.6)).current;
  
  // Diet preference data with improved descriptions and icons
  const preferences = [
    { 
      id: 1, 
      label: 'No Preference', 
      description: 'I eat everything and have no specific dietary restrictions',
      img: require('../../../assets/images/dish.png') 
    },
    { 
      id: 2, 
      label: 'Vegetarian', 
      description: 'Plant-based diet excluding meat, fish, and poultry',
      img: require('../../../assets/images/dish.png') 
    },
    { 
      id: 3, 
      label: 'Keto friendly', 
      description: 'Low-carb, high-fat diet that helps burn fat more effectively',
      img: require('../../../assets/images/dish.png') 
    },
    { 
      id: 4, 
      label: 'Mediterranean', 
      description: 'Rich in fruits, vegetables, whole grains, and healthy fats',
      img: require('../../../assets/images/dish.png') 
    },
    { 
      id: 5, 
      label: 'Paleo', 
      description: 'Based on foods similar to what might have been eaten during the Paleolithic era',
      img: require('../../../assets/images/dish.png') 
    },
    { 
      id: 6, 
      label: 'Pescatarian', 
      description: 'Plant-based diet that includes fish and seafood',
      img: require('../../../assets/images/dish.png') 
    },
    { 
      id: 7, 
      label: 'Crustacean free', 
      description: 'Excludes crustaceans like shrimp, crab, and lobster',
      img: require('../../../assets/images/dish.png') 
    }
  ];

  const handleSelect = (label) => {
    setSelectedPreference(label);
    
    // Animate button when selection changes
    Animated.parallel([
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    console.log('Selected Preference:', selectedPreference);
    updateRegistrationData('dietType', selectedPreference);
    navigation.navigate('allergens');
  };

  // Calculate progress for the progress bar
  const currentStep = 2;
  const totalSteps = 5;
  const progress = currentStep / totalSteps;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Progress Bar */}
      {/* <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { width: `${progress * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{currentStep}/{totalSteps}</Text>
      </View> */}

      {/* Title and Subtitle */}
      <View style={styles.header}>
        <Text style={styles.title}>What's your dietary style?</Text>
        <Text style={styles.subtitle}>
          We'll personalize your meal recommendations based on your preferences.
        </Text>
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
            accessible={true}
            accessibilityLabel={`${item.label}. ${item.description}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedPreference === item.label }}
          >
            <View style={styles.preferenceContent}>
              <Image
                source={item.img}
                style={[
                  styles.preferenceImage,
                  selectedPreference === item.label && styles.selectedImage
                ]}
              />
              
              <View style={styles.textContainer}>
                <Text style={[
                  styles.preferenceText,
                  selectedPreference === item.label && styles.selectedText,
                ]}>
                  {item.label}
                </Text>
                <Text style={styles.descriptionText}>
                  {item.description}
                </Text>
              </View>

              <View style={[
                styles.radioButton,
                selectedPreference === item.label && styles.selectedRadioButtonBorder
              ]}>
                {selectedPreference === item.label && 
                  <View style={styles.selectedRadioButton} />
                }
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Next Button */}
      <Animated.View 
        style={[
          styles.buttonContainer,
          { 
            opacity: buttonOpacity,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedPreference && styles.disabledButton,
          ]}
          disabled={!selectedPreference}
          onPress={handleNext}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel="Continue to next step"
          accessibilityRole="button"
          accessibilityState={{ disabled: !selectedPreference }}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>

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
    marginTop:20
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#EDF2F7',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 24,
  },
  listContainer: {
    paddingBottom: 20,
  },
  preferenceItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  selectedItem: {
    borderColor: '#4A90E2',
    backgroundColor: '#F7FAFF',
    shadowColor: '#4A90E2',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  preferenceImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    padding: 8,
  },
  selectedImage: {
    backgroundColor: '#EBF8FF',
  },
  textContainer: {
    flex: 1,
  },
  preferenceText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  selectedText: {
    color: '#4A90E2',
    fontWeight: '700',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  selectedRadioButtonBorder: {
    borderColor: '#4A90E2',
  },
  selectedRadioButton: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A90E2',
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footerNote: {
    fontSize: 13,
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});

export default DietaryPreferencesScreen;