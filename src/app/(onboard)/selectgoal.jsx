import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import Animated,{FadeIn, FadeInRight} from 'react-native-reanimated';
import { useNavigation } from 'expo-router';
import Progressbar from '../../components/progressbar';
import { useRegistrationContext } from '../context/RegistrationContext';

const GoalsScreen = () => {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const navigation = useNavigation();
  const { registrationData, updateRegistrationData } = useRegistrationContext({});
  useEffect(()=>{
    console.log("Context Information....................................", registrationData);
  },[registrationData])
  
  const goals = [
    'Lose Weight',
    'Maintain Weight',
    'Gain Weight',
    'Gain Muscle',
    'Modify My Diet',
    'Manage Stress',
    'Increase My Step Count',
  ];

  const toggleGoal = (goal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else if (selectedGoals.length < 3) {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const isGoalSelected = (goal) => selectedGoals.includes(goal);

  return (
    <Animated.View
      style={styles.outercontainer}
      entering={FadeInRight.duration(1000)}
    >
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Goals</Text>
        <Progressbar cone={1} ctwo={0} cthree={0} cfour={0} cfive={0} csix={0}/>
        <Text style={styles.subtitle}>
          Select up to 3 that are important to you, including one weight goal.
        </Text>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.goalItem,
              isGoalSelected(item) && styles.selectedGoal,
            ]}
            onPress={() => toggleGoal(item)}
          >
            <Text
              style={[
                styles.goalText,
                isGoalSelected(item) && styles.selectedGoalText,
              ]}
            >
              {item}
            </Text>
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
        onPress={()=>{
          updateRegistrationData('goals', selectedGoals);
          navigation.navigate('ageselect')
        }}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outercontainer:{
    flex:1,
    // marginTop:'8%'
  },
  container: {
    flex: 1,
    // backgroundColor: '#1c1c1e',
    backgroundColor:'#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    // color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1a6',
    marginTop:'2%'
  },
  goalsList: {
    paddingBottom: 20,
  },
  goalItem: {
    // backgroundColor: '#2c2c2e',
    backgroundColor:'#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedGoal: {
    // backgroundColor: '#007aff',
    // backgroundColor:'#FF5722'
    backgroundColor:'black'
  },
  goalText: {
    fontSize: 16,
    // color: '#fff',
  },
  selectedGoalText: {
    color: '#fff',
    fontWeight: '600',
  },
  nextButton: {
    // backgroundColor: '#007aff',
    // backgroundColor:'#FF5722',
    backgroundColor:'black',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#3a3a3c',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default GoalsScreen;
