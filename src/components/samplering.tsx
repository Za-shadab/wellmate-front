import CircularProgress from 'react-native-circular-progress-indicator';
import React from 'react';
import { View } from './Themed';


const SampleChartOne = ()=>{
    return(
        <View>
            <CircularProgress
                value={90}
                radius={120}
                duration={2000}
                progressValueColor={'red'}
                maxValue={5000}
                titleColor={'black'}
                titleStyle={{fontWeight: 'bold'}}
                strokeColorConfig={[
                    { color: 'red', value: 0 },
                    { color: 'skyblue', value: 50 },
                    { color: 'yellowgreen', value: 100 },
                  ]}
                />
        </View>
    )
}


export default SampleChartOne