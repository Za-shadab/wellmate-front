import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Value from '@/src/components/Value';
import RingProgress from '@/src/components/RingProgress';
import { useEffect } from 'react';
import DataSetSteppedChart from '@/src/components/testgraph';

export default function TabTwoScreen() {
  return (
    <ScrollView>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.heading}>Daily Activity</Text>

        {/* Steps Progress */}
        <View style={styles.shadowBox}>
          <Text style={styles.subHeading}>Steps Progress</Text>
          <View style={styles.centeredView}>
            <RingProgress
              radius={120}
              strokeWidth={10}
              progress={0.8}
              value={3000}
              color={"#1E90FF"}
              icon={require("../../../assets/images/steps_blue.png")}
              iconHeight={50}
              labelSize={30}
              icontop={8}
              labeltop={14}
            />
        </View>
          <View>
          <Text style={styles.description}>
            You’ve completed 80% of your step goal for today.
          </Text>
          <Text style={styles.description}>
            Keep it up!
          </Text>
          </View>
        </View>


        {/* Heart Rate Graph */}
        <View style={styles.shadowBox}>
          <Text style={styles.subHeading}>Heart Rate Overview</Text>
          <DataSetSteppedChart />
          <Text style={styles.description}>
            View your heart rate trends throughout the day. Stay active and monitor your health.
          </Text>
        </View>

        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontWeight:'600'
  },
  shadowBox: {
    flex: 1,
    width: '100%',
    gap: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  statBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  statLabel: {
    marginTop: 25,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});
