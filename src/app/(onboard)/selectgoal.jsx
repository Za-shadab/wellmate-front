import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Image,
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Goals</Text>
          <Progressbar cone={1} ctwo={0} cthree={0} cfour={0} cfive={0} csix={0} />
          <Text style={styles.subtitle}>
            Select up to 3 goals that are important to you
            {selectedGoals.length > 0 && ` (${selectedGoals.length} selected)`}.
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
            >
              <View style={styles.goalContent}>
                <Text
                  style={[
                    styles.goalText,
                    isGoalSelected(item.str) && styles.selectedGoalText,
                  ]}
                >
                  {item.str}
                </Text>
                <Image source={item.img} style={styles.goalImage} />
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.goalsList}
        />

        <TouchableOpacity 
          style={[
            styles.nextButton,
            selectedGoals.length === 0 && styles.disabledButton,
          ]}
          disabled={selectedGoals.length === 0}
          onPress={() => {
            updateRegistrationData('goals', selectedGoals);
            navigation.navigate('ageselect');
          }}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outercontainer: {
    flex: 1,
    // marginTop: '8%',
    backgroundColor: '#F7F8FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: '2%',
    lineHeight: 22,
  },
  goalsList: {
    paddingBottom: 20,
  },
  goalItem: {
    backgroundColor: '#E2E8F0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedGoal: {
    backgroundColor: '#4A90E2',
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },
  selectedGoalText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  goalImage: {
    width: 34,
    height: 34,
    marginLeft: 10,
  },
  nextButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },    
  disabledButton: {
    backgroundColor: '#A0AEC0',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default GoalsScreen;
