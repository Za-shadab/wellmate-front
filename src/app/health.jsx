import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform} from 'react-native';

const HealthInfo =() =>{
    return(
        <View style={styles.container}>
            <Text style={styles.text}>Welcome!</Text>
        </View>
    )
}

export default HealthInfo;

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    text:{
        fontSize:30
    }
})