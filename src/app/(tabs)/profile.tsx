import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/src/components/EditScreenInfo';
import { Text, View } from '@/src/components/Themed';
import SampleChartOne from '@/src/components/samplering';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Text>profile Tab</Text>
      <SampleChartOne/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
