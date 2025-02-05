import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList,Image, Dimensions } from 'react-native';
import { ProgressBar, MD3Colors } from 'react-native-paper';
import RingProgress from '@/src/components/RingProgress';
// import { flingGestureHandlerProps } from 'react-native-gesture-handler/lib/typescript/handlers/FlingGestureHandler';
import AntDesign from '@expo/vector-icons/AntDesign';





const SummarySlider = () =>{
  const Item_width = 310
  const { width } = Dimensions.get('window');
  const UserDailySummary = [
    {id: 1, calConsumed: 1200, calGoal: 2000, img:require("../../../assets/images/eat.png"), ringcolor:'#4A90E2'},
    {id:2, calConsumed: 1200, calGoal: 2000, img:require("../../../assets/images/balanced-diet.png"), ringcolor:'orange'},
    {id:3, calConsumed: 1200, calGoal: 2000, img:require("../../../assets/images/eat.png"), ringcolor:'black'}
  ]
  return(
    <FlatList
      data={UserDailySummary}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={310}
      decelerationRate={'fast'}
      renderItem={({item}) =>(
      <View style={styles.Summarycard}>
        <Text style={styles.cardTitle}>Today's Summary</Text>
        <View
        style={{
          marginTop:20,
          marginBottom:20
        }}
        >
              <RingProgress
                radius={60}
                strokeWidth={3}
                color={item.ringcolor}
                progress={(item.calConsumed/item.calGoal)}
                value={''}
                icon={item.img}
                iconHeight={70}
                labelSize={15}
                icontop={8}
                labeltop={28}
              />
        </View>
    
        <View style={styles.summaryRow}>
          <Text>Calories Consumed:</Text>
          <Text>{item.calConsumed} / {item.calGoal} kcal</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text >Remainig calories:</Text>
          <Text >20%</Text>
        </View>
      </View>
  )}
    />
  )
}

const Dashboard = () => {
  const [waterIntake, setWaterIntake] = useState(0);
  const [notifications, setNotifications] = useState([
    { id: '1', message: 'Time to log your breakfast!' },
    { id: '2', message: 'You haven’t met your step goal today.' },
    { id: '3', message: 'Hydration reminder: Drink a glass of water.' },
  ]);

  const addWater = () => {
    if (waterIntake < 100) {
      setWaterIntake(waterIntake + 10);
    } else {
      Alert.alert('Great job!', 'You have met your water intake goal for the day!');
    }
  };

  const healthStats = [
    { title: 'Steps Taken', value: 5000, img:require('../../../assets/images/steps_blue.png'), ringcolor:'#4A90E2'},
    { title: 'Calories Burned', value: '450 kcal', img:require('../../../assets/images/kcal.png'), ringcolor:'orange' },
    { title: 'Sleep Duration', value: '6h 45m', img:require('../../../assets/images/steps_blue.png'), ringcolor:'purple' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Personalized Greeting */}

      <View style={styles.greetingContainer}>
        <View>
          <Text style={styles.greeting}>Good Morning, User!</Text>
          <Text style={styles.motivation}>"Every step counts—keep going!"</Text>
        </View>
        <View
          style={{
            height:80,
            // width:80,
            borderRadius:40,
          }}
        >
          <Image source={require("../../../assets/images/fit1.jpg")}
            style={{
              height:80,
              aspectRatio:1,
              resizeMode:'contain'
            }}
          />
        </View>
      </View>

      {/* Summary Section */}
      <SummarySlider/>
      {/* Health Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Health Stats</Text>
        {healthStats.map((stat, index) => (
          <View key={index} style={styles.healthStatRow}>
                <RingProgress
                radius={30}
                strokeWidth={3}
                color={stat.ringcolor}
                progress={0.8}
                value={''}
                icon={stat.img}
                iconHeight={25}
                labelSize={15}
                icontop={6}
                labeltop={18}
              />
            <Text style={{textAlign:'center',alignSelf:'center'}}>{stat.title}</Text>
            <Text style={{textAlign:'center',alignSelf:'center'}}>{stat.value}</Text>
          </View>
        ))}
      </View>

      {/* Notifications Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notifications</Text>
        {
          notifications.map((notification)=>(
            <Text style={styles.notification} key={notification.id}>{notification.message}</Text>
          ))
        }
      </View>

      {/* Water Intake Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Water Intake</Text>
        <ProgressBar
          progress={waterIntake / 100}
          color={MD3Colors.primary0}
          style={styles.progressBar}
        />
        <Text style={styles.waterText}>{waterIntake} / 100%</Text>
        <TouchableOpacity style={styles.button} onPress={addWater}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  greetingContainer: {
    flex:1,
    marginBottom: 20,
    flexDirection:'row',
    alignContent:'center',
    justifyContent:'space-between'
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    alignSelf:'center'
  },
  motivation: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    alignSelf:'center'
  },
  Summarycard:{
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginHorizontal:5,
    flex: 1,  // Ensures all cards have equal width
    width: 310,  // Optional: Set a max width if needed
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  healthStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  notification: {
    backgroundColor: '#f0f4ff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginTop: 10,
    backgroundColor: '#e0e0e0',
  },
  waterText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    marginTop: 15,
    backgroundColor: '#007bff',
    width:50,
    height:50,
    borderRadius: 25,
    flex:1,
    justifyContent:'center',
    alignItems: 'center',
    margin:'auto'
  },
  buttonText: {
    color: '#fff',
    fontSize: 36,
  },
});

export default Dashboard;
