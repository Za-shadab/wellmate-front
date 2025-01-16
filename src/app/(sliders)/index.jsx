import React,{useState, useEffect} from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform, FlatList, Dimensions} from 'react-native';
import Animated, { FadeInDown, BounceOut, BounceInUp, SlideInUp} from 'react-native-reanimated';
import {Link, Redirect} from 'expo-router'
import { StatusBar } from 'expo-status-bar';


function FirstScreen(){

        function ImageSlider({ imagesource }){
            return(
                <Animated.View style={styles.imageContainer}>
                <Animated.Image
                entering={BounceInUp.duration(2000)}
                exiting={SlideInUp.duration(300)}
                style={styles.img}
                source={imagesource}
            />
                </Animated.View>
            )
        }

return(
    <View style={styles.container}>
        <ImageSlider imagesource={require("../../../assets/images/Frame (4).png")}/>

        <Animated.View 
        style={styles.shapeone}>
            <Animated.Text style={styles.weltxt} entering={BounceInUp.delay(100).duration(2000)}>Welcome</Animated.Text>
            <Animated.Text style={styles.txt} entering={BounceInUp.delay(100).duration(2000)}>Your Personalized Wellness Companion along your journey</Animated.Text>
        </Animated.View>


        <Link href={'/second'} asChild>
            <Pressable>
                <Animated.View style={styles.titleContainer} entering={FadeInDown.delay(200).duration(2000)}>
                <Animated.Text style={styles.title}>Let's Start</Animated.Text>
                </Animated.View>
                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
            </Pressable>
        </Link>
    </View>
)
}
export default FirstScreen


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
        padding:10,
        flex:1,
        justifyContent:'center',
        alignItems:'center'    
    },
    img:{
        height:'80%',
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