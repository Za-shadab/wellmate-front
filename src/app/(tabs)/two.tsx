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
              progress={0.8}
              value={3000}
              color={"#1E90FF"}
              icon={require("../../../assets/images/steps_blue.png")}
              iconHeight={50}
              labelSize={30}
              icontop={4.5}
              labeltop={8}
            />
          </View>
          <Text style={styles.description}>
            You’ve completed 80% of your step goal for today. Keep it up!
          </Text>
        </View>

        {/* Additional Progress Rings */}
        <View style={styles.shadowBox}>
          <Text style={styles.subHeading}>Additional Stats</Text>
          <View style={styles.rowView}>
            <View style={styles.statBox}>
              <RingProgress
                radius={33}
                strokeWidth={5}
                color={"#E65100"}
                progress={0.8}
                value={`2kcal`}
                icon={require("../../../assets/images/kcal.png")}
                iconHeight={30}
                labelSize={15}
                icontop={4}
                labeltop={14}
              />
              <Text style={styles.statLabel}>Calories Burned</Text>
            </View>

            <View style={styles.statBox}>
              <RingProgress
                radius={33}
                strokeWidth={5}
                color={"#006064"}
                progress={0.8}
                value={`2km/hr`}
                icon={require("../../../assets/images/wspeed.png")}
                iconHeight={30}
                labelSize={15}
                icontop={4}
                labeltop={14}
              />
              <Text style={styles.statLabel}>Walking Speed</Text>
            </View>

            <View style={styles.statBox}>
              <RingProgress
                radius={33}
                strokeWidth={5}
                color={"#FFB800"}
                progress={0.8}
                value={`200kms`}
                icon={require("../../../assets/images/placeholder.png")}
                iconHeight={30}
                labelSize={15}
                icontop={4}
                labeltop={14}
              />
              <Text style={styles.statLabel}>Distance Traveled</Text>
            </View>
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
    padding: 20,
    backgroundColor: '#F8F9FA',
    gap: 50,
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
    marginTop: 10,
    textAlign: 'center',
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
    elevation: 5,
    marginBottom: 20,
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
