// import React, { useRef, useEffect } from "react";
// import { ScrollView, StyleSheet, Text, View, Animated, LayoutAnimation, UIManager, Platform, SafeAreaView } from "react-native";
// import { LineChart } from "react-native-gifted-charts";
// import CaloriesBurnt from "@/src/components/caloriesBurn";

// if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function App() {
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 1000,
//       useNativeDriver: true,
//     }).start();
//   }, [fadeAnim]);

//   const heartRateData = [
//     { value: 50, label: "Jan" },
//     { value: 80, label: "Feb" },
//     { value: 70, label: "Mar" },
//     { value: 90, label: "Apr" },
//     { value: 80, label: "May" },
//     { value: 60, label: "June" },
//     { value: 90, label: "July" },
//   ];

//   const workoutProgressData = [
//     { value: 60, label: "Sun" },
//     { value: 80, label: "Mon" },
//     { value: 70, label: "Tue" },
//     { value: 90, label: "Wed" },
//     { value: 50, label: "Thu" },
//     { value: 100, label: "Fri" },
//     { value: 40, label: "Sat" },
//   ];

//   const animateLayout = () => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//   };

//   return (
//     <SafeAreaView style={styles.maincontainer}>
//     <ScrollView
//       style={styles.container}
//       onScrollBeginDrag={animateLayout}
//     >
    
//       {/* Welcome Section */}
//       <Animated.View style={[styles.welcomeSection, { opacity: fadeAnim }]}>
//         <Text style={styles.welcomeText}>Welcome Back,</Text>
//         <Text style={styles.userName}>Stefani Wong</Text>
//       </Animated.View>

//       {/* BMI Section */}
//       <View style={styles.bmiCard}>
//         <Text style={styles.bmiTitle}>BMI (Body Mass Index)</Text>
//         <Text style={styles.bmiSubtitle}>You have a normal weight</Text>
//         <Text style={styles.bmiValue}>20.1</Text>
//       </View>

//       {/* Activity Status Section */}
//       <View style={styles.activitySection}>
//         <Text style={styles.sectionTitle}>Activity Status</Text>

//         {/* Heart Rate */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Heart Rate</Text>
//           <Text style={styles.cardValue}>78 BPM</Text>
//           <LineChart
//             data={heartRateData}
//             width={240}
//             height={200}
//             isAnimated
//             curved
//             spacing={50}
//             hideDataPoints
//             xAxisColor="#6C63FF"
//             yAxisColor="#6C63FF"
//             color="#6C63FF"
//           />
//         </View>
//       </View>

//       {/* Workout Progress */}
//       <View style={styles.workoutSection}>
//         <Text style={styles.sectionTitle}>Workout Progress</Text>

//         <View style={styles.card}>
//         <LineChart
//           data={workoutProgressData}
//           width={240}
//           height={200}
//           isAnimated
//           spacing={50}
//           hideDataPoints
//           curved
//           xAxisColor="#FF6347"
//           yAxisColor="#FF6347"
//           color="#FF6347"
//         />
//         </View>
//       </View>

//       <CaloriesBurnt/>
//     </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   maincontainer:{
//     flex:1,
//   },
//   container: {
//     flex: 1,
//     backgroundColor: "#F8F8F8",
//     padding: 20,
//   },
//   welcomeSection: {
//     marginBottom: 20,
//     transform: [{ translateY: -20 }],
//   },
//   welcomeText: {
//     fontSize: 16,
//     color: "#888",
//   },
//   userName: {
//     fontSize: 24,
//     fontWeight: "bold",
//   },
//   bmiCard: {
//     backgroundColor: "#E9ECFF",
//     padding: 20,
//     borderRadius: 10,
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   bmiTitle: {
//     fontSize: 16,
//     color: "#888",
//   },
//   bmiSubtitle: {
//     fontSize: 14,
//     color: "#6C63FF",
//   },
//   bmiValue: {
//     fontSize: 32,
//     fontWeight: "bold",
//     color: "#6C63FF",
//     textAlign: "center",
//   },
//   activitySection: {
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   card: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 10,
//     marginBottom: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//     transform: [{ scale: 0.98 }],
//   },
//   cardTitle: {
//     fontSize: 14,
//     color: "#888",
//   },
//   cardValue: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#000",
//   },
//   workoutSection: {
//     marginBottom: 20,
//   },
// });

import React from "react";
import { ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { ProgressBar } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";

export default function App() {
  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome Back,</Text>
        <Text style={styles.userName}>Stefani Wong</Text>
      </View>

      {/* BMI Section */}
      <View style={styles.bmiCard}>
        <Text style={styles.bmiTitle}>BMI (Body Mass Index)</Text>
        <Text style={styles.bmiSubtitle}>You have a normal weight</Text>
        <Text style={styles.bmiValue}>20.1</Text>
      </View>

      {/* Target Section */}
      <View style={styles.targetSection}>
        <Text style={styles.targetText}>Today Target</Text>
        <View style={styles.targetButton}>
          <Text style={styles.buttonText}>Check</Text>
        </View>
      </View>

      {/* Activity Status Section */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Activity Status</Text>

        {/* Heart Rate */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Heart Rate</Text>
          <Text style={styles.cardValue}>78 BPM</Text>
          <LineChart
            data={{
              labels: ["", "", "", "", ""],
              datasets: [
                {
                  data: [72, 76, 78, 74, 78],
                },
              ],
            }}
            width={200}
            height={100}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
            }}
            style={styles.chart}
          />
        </View>

        {/* Water Intake */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Water Intake</Text>
          <Text style={styles.cardValue}>4 Litres</Text>
          <ProgressBar progress={0.8} color="#6C63FF" style={styles.progressBar} />
        </View>

        {/* Sleep */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sleep</Text>
          <Text style={styles.cardValue}>8h 20m</Text>
        </View>

        {/* Calories */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calories</Text>
          <Text style={styles.cardValue}>760 Kcal</Text>
        </View>
      </View>

      {/* Workout Progress */}
      <View style={styles.workoutSection}>
        <Text style={styles.sectionTitle}>Workout Progress</Text>
        <LineChart
          data={{
            labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            datasets: [
              {
                data: [60, 80, 70, 90, 50, 100, 40],
              },
            ],
          }}
          width={300}
          height={200}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={styles.chart}
        />
      </View>

      {/* Latest Workout */}
      <View style={styles.latestWorkoutSection}>
        <Text style={styles.sectionTitle}>Latest Workout</Text>
        <View style={styles.workoutCard}>
          <Text style={styles.workoutTitle}>Fullbody Workout</Text>
          <Text style={styles.workoutDetails}>180 Calories Burn | 20 minutes</Text>
        </View>
        <View style={styles.workoutCard}>
          <Text style={styles.workoutTitle}>Lowerbody Workout</Text>
          <Text style={styles.workoutDetails}>200 Calories Burn | 30 minutes</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: "#888",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  bmiCard: {
    backgroundColor: "#E9ECFF",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  bmiTitle: {
    fontSize: 16,
    color: "#888",
  },
  bmiSubtitle: {
    fontSize: 14,
    color: "#6C63FF",
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6C63FF",
    textAlign: "center",
  },
  targetSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  targetText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  targetButton: {
    backgroundColor: "#6C63FF",
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  activitySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    color: "#888",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  progressBar: {
    height: 10,
    marginTop: 10,
  },
  workoutSection: {
    marginBottom: 20,
  },
  chart: {
    marginVertical: 10,
  },
  latestWorkoutSection: {
    marginBottom: 20,
  },
  workoutCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  workoutDetails: {
    fontSize: 14,
    color: "#888",
  },
});
