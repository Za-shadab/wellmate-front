import React,{useState, useEffect} from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform, FlatList,Dimensions} from 'react-native';
import {Link, Redirect} from 'expo-router'
import { StatusBar } from 'expo-status-bar';
import Animated, { BounceOut, BounceInUp, BounceInRight} from 'react-native-reanimated';





const SecondScreen = () => {

    function ImageSlider({ imagesource }){
        return(
            <Animated.View style={styles.imageContainer}>
            <Animated.Image
            entering={BounceInRight.duration(2000)}
            style={styles.img}
            source={imagesource}
        />
            </Animated.View>
        )
    }

    return(
        <View style={styles.container}>
            <ImageSlider imagesource={require("../../../assets/images/Frame (1).png")}/>

            <Animated.View 
            style={styles.shapeone}>
                <Animated.Text style={styles.weltxt} entering={BounceInRight.delay(100).duration(2000)}>Relax</Animated.Text>
                <Animated.Text style={styles.txt} entering={BounceInRight.delay(200).duration(2000)}>Unwind, recharge, and find your calm—WellMate helps you embrace relaxation for a balanced life!</Animated.Text>
            </Animated.View>


            <Link href={'(auth)'} asChild>
                <Pressable>
                    <Animated.View style={styles.titleContainer} entering={BounceInRight.delay(300).duration(2000)}>
                    <Animated.Text style={styles.title}>Let's Start</Animated.Text>
                    </Animated.View>
                    <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
                </Pressable>
            </Link>
        </View>
    )
}


export default SecondScreen;

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems:'center',
        // backgroundColor:'#FFF5CD',
        backgroundColor:'white'
    },
    imageContainer:{
        width:Dimensions.get('window').width,
        // padding:10,
        flex:1,
        justifyContent:'center',
        alignItems:'center',   
    },
    img:{
        height:'70%',
        aspectRatio:1,
        resizeMode:'cover'
    },
    titleContainer:{
        marginTop:50,
        backgroundColor:'black',
        borderRadius:20,
        height:'20%',
        width: 150,
        justifyContent:'center'
    },
    title:{
        fontSize:20,
        color:'white',
        textAlign:'center',
    },
    shapeone:{
        width:'78%',
        height:'10%',
        justifyContent:'center',
    },
    txt:{
        color:'black',
        fontSize:16,
        textAlign:'center'
    },
    weltxt:{
        fontSize:32,
        textAlign:'center'
    }
})