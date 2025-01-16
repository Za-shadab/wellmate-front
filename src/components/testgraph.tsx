import React from 'react';
import {View, Text, Image, AppState} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';

const LineChartTwo = () => {
  const lineData = [
    {value: 15, label: 'Mon'},
    {value: 30, label: 'Tue'},
    {value: 23, label: 'Wed'},
    {value: 40, label: 'Thu'},
    {value: 16, label: 'Fri'},
    {value: 40, label: 'Sat'},
  ];
  return (
    <View
      style={{
        overflow:'hidden',
        padding:10
      }}
    >
      <Text
        style={{
          fontWeight:'500',
          fontSize:20
        }}
      >Heart Rate</Text>
      <Image source={require('@/assets/images/heart-rate.png')}
        style={{
          height:30,
          aspectRatio:1,
          marginBottom:20
        }}
      />
      <LineChart
        areaChart
        curved
        data={lineData}
        height={250}
        width={285}
        initialSpacing={0}
        hideOrigin
        color1="skyblue"
        textColor1="green"
        hideRules
        dataPointsColor1="blue"
        startFillColor1="skyblue"
        startOpacity={0.8}
        endOpacity={0.3}
        textFontSize={13}
      />
    </View>
  );
};

export default LineChartTwo;