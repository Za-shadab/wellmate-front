import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { ruleTypes } from 'gifted-charts-core';

const CaloriesBurnt = () => {
  const data1 = [
    { value: 70 },
    { value: 36 },
    { value: 50 },
    { value: 40 },
    { value: 18 },
    { value: 38 },
  ];
  const data2 = [
    { value: 50 },
    { value: 10 },
    { value: 45 },
    { value: 30 },
    { value: 45 },
    { value: 18 },
  ];

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <LineChart
          areaChart
          curved
          data={data1}
          data2={data2}
          hideDataPoints
          spacing={68}
          color1="#8a56ce"
          color2="#56acce"
          startFillColor1="#8a56ce"
          startFillColor2="#56acce"
          endFillColor1="#8a56ce"
          endFillColor2="#56acce"
          startOpacity={0.8}
          endOpacity={0.2}
          initialSpacing={0}
          noOfSections={4}
          yAxisColor="white"
          yAxisThickness={0}
          rulesType={ruleTypes.DASHED}
          rulesColor="transparent"
          yAxisTextStyle={{ color: 'gray' }}
          yAxisLabelSuffix="%"
          xAxisColor="transparent"
          pointerConfig={{
            pointerStripUptoDataPoint: true,
            pointerStripColor: 'lightgray',
            pointerStripWidth: 2,
            strokeDashArray: [2, 5],
            pointerColor: 'lightgray',
            radius: 4,
            pointerLabelWidth: 100,
            pointerLabelHeight: 120,
            pointerLabelComponent: items => (
              <View style={styles.pointerLabel}>
                <Text style={styles.pointerText}>{2018}</Text>
                <Text style={styles.pointerValue}>{items[0].value}</Text>
                <Text style={[styles.pointerText, { marginTop: 12 }]}>
                  {2019}
                </Text>
                <Text style={styles.pointerValue}>{items[1].value}</Text>
              </View>
            ),
          }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  pointerLabel: {
    height: 120,
    width: 100,
    backgroundColor: '#282C3E',
    borderRadius: 4,
    justifyContent: 'center',
    paddingLeft: 16,
  },
  pointerText: {
    color: 'lightgray',
    fontSize: 12,
  },
  pointerValue: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CaloriesBurnt;
