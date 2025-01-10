import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Value from '@/src/components/Value';
import RingProgress from '@/src/components/RingProgress';
// import readSampleData from '@/src/hooks/usehealthdata';
import useHealthData from '@/src/hooks/usehealthdata'
import { useEffect } from 'react';

export default function TabTwoScreen() {
  const totalSteps = useHealthData();
  
  return (
    <View style={styles.container}>
      <Text
      style={styles.heading}
      >You have Walked {totalSteps} Steps
      </Text>

      <View style={{flex:1, justifyContent:'center'}}>
            <RingProgress 
                progress={0.8} 
                value={totalSteps} 
                color={"#1E90FF"} 
                icon={require("../../../assets/images/steps_blue.png")} 
                iconHeight={50} 
                labelSize={30}
                icontop={4.5}
                labeltop={8}
            />
        </View>
 
        <View style={{flex:1, justifyContent:'center', alignItems:'center', flexDirection:'row', gap:20}}>
          <RingProgress 
              radius={40} 
              strokeWidth={8} 
              color={"#E65100"} 
              progress={0.8} 
              value={`2kcal`} 
              icon={require("../../../assets/images/kcal.png")} 
              iconHeight={40} 
              labelSize={20}
              icontop={2.5}
              labeltop={12}
          />
            <RingProgress 
              radius={40} 
              strokeWidth={8} 
              color={"#006064"} 
              progress={0.8} 
              value={`2km/hr`} 
              icon={require("../../../assets/images/wspeed.png")} 
              iconHeight={40} 
              labelSize={20}
              icontop={2.5}
              labeltop={12}
          />
            <RingProgress 
              radius={40} 
              strokeWidth={8} 
              color={"#FFB800"} 
              progress={0.8} 
              value={`200kms`} 
              icon={require("../../../assets/images/placeholder.png")} 
              iconHeight={40} 
              labelSize={20}
              icontop={2.5}
              labeltop={12}
          />
        </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems:'center',
    padding:20
  },
  heading:{
    fontSize:32,
    alignSelf:'center',
    marginTop:40,
    fontWeight:500,
  }
});



