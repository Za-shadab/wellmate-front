import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Image,
  StatusBar,
} from 'react-native';
import Animated, { FadeInRight, FadeInLeft } from 'react-native-reanimated';
import { useNavigation } from 'expo-router';
import Progressbar from '../../components/progressbar';
import { useRegistrationContext } from '../context/RegistrationContext';

const GoalsScreen = () => {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const navigation = useNavigation();
  const { registrationData, updateRegistrationData } = useRegistrationContext({});

  useEffect(() => {
    console.log('Context Information:', registrationData);
  }, [registrationData]);

  const goals = [
    { str: 'Lose Weight', img: require('../../../assets/images/scales.png') },
    { str: 'Maintain Weight', img: require('../../../assets/images/gain.png') },
    { str: 'Gain Weight', img: require('../../../assets/images/weight.png') },
    { str: 'Gain Muscle', img: require('../../../assets/images/muscle.png') },
    { str: 'Modify My Diet', img: require('../../../assets/images/balanced-diet.png') },
    { str: 'Manage Stress', img: require('../../../assets/images/stress-management.png') },
    { str: 'Increase My Step Count', img: require('../../../assets/images/running-shoes.png') },
  ];

  const conflictingGoals = ['Gain Weight', 'Lose Weight', 'Maintain Weight'];

  const toggleGoal = (goal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else if (conflictingGoals.includes(goal)) {
      const hasConflictingGoal = selectedGoals.some((g) => conflictingGoals.includes(g));
      if (!hasConflictingGoal) {
        setSelectedGoals([...selectedGoals, goal]);
      }
    } else if (selectedGoals.length < 3) {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const isGoalSelected = (goal) => selectedGoals.includes(goal);

  return (
    <Animated.View
      style={styles.outercontainer}
      entering={FadeInRight.duration(300)}
      exiting={FadeInLeft.duration(300)}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>What are your goals?</Text>
          <Text style={styles.subtitle}>
            Select up to 3 goals that are important to you
            {selectedGoals.length > 0 && ` (${selectedGoals.length}/3)`}
          </Text>
        </View>

        <FlatList
          data={goals}
          keyExtractor={(item) => item.str}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.goalItem,
                isGoalSelected(item.str) && styles.selectedGoal,
              ]}
              onPress={() => toggleGoal(item.str)}
              activeOpacity={0.7}
            >
              <View style={styles.goalContent}>
                <View style={styles.goalTextContainer}>
                  <Text
                    style={[
                      styles.goalText,
                      isGoalSelected(item.str) && styles.selectedGoalText,
                    ]}
                  >
                    {item.str}
                  </Text>
                </View>
                <View style={[
                  styles.imageContainer,
                  isGoalSelected(item.str) && styles.selectedImageContainer
                ]}>
                  <Image source={item.img} style={styles.goalImage} />
                </View>
                {isGoalSelected(item.str) && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.goalsList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.nextButton,
              selectedGoals.length === 0 && styles.disabledButton,
            ]}
            disabled={selectedGoals.length === 0}
            onPress={() => {
              updateRegistrationData('goals', selectedGoals);
              navigation.navigate('ageselect');
              selectedGoals.map((s)=>{
                if (selectedGoals.some(goal => goal === 'Lose Weight' || goal === 'Gain Weight')) {
                  navigation.navigate('selectweight');
                } else {
                  navigation.navigate('activitylevel');
                }
              })
            }}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outercontainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    // paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderRadius: 30,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 15,
    // elevation: 5,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFilled: {
    width: '16.7%', // 1/6 of the progress
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
  },
  goalsList: {
    paddingBottom: 20,
  },
  goalItem: {
    backgroundColor: '#F7FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedGoal: {
    backgroundColor: '#EBF4FF',
    borderColor: '#4A90E2',
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  goalTextContainer: {
    flex: 1,
  },
  goalText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '600',
  },
  selectedGoalText: {
    color: '#2C5282',
    fontWeight: '700',
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImageContainer: {
    backgroundColor: '#BEE3F8',
  },
  goalImage: {
    width: 28,
    height: 28,
  },
  checkmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  nextButton: {
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },    
  disabledButton: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0.1,
  },
  nextButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default GoalsScreen;