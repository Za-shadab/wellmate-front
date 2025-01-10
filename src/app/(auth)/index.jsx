import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform} from 'react-native';
import {Link} from 'expo-router'
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, BounceOut, BounceInUp,} from 'react-native-reanimated';

const Onboard = () => {
    return(
        <View style={styles.container}>
            <Link href={'./login'} asChild>
                <Pressable style={styles.titleContainer}>
                    <Text style={styles.text}>Login as User</Text>
                </Pressable>
            </Link>
        </View>
    )
}


export default Onboard;

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems:'center'
    },
    titleContainer:{
        marginTop: 20,
        width: 150,
        height:'5%',
        backgroundColor:'#006994',
        borderRadius:20,
        justifyContent:'center',
        alignItems:'center',
    },
    text:{
        color:'white'
    }
})