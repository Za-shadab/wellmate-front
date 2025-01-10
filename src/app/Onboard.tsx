import React,{useState, useEffect} from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform} from 'react-native';
import {Link} from 'expo-router'
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, BounceOut, BounceInUp,} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, StackActions } from '@react-navigation/native';

const Onboard = () => {
    const navigation = useNavigation()
    const[isLoggedIn, setisLoggedIn] = useState<string | null>(null)

    async function getData(){
    const data = await AsyncStorage.getItem('isLoggedIn');
    console.log('In _layout.tsx',data);
    setisLoggedIn(data)
    }   
    
    useEffect(()=>{
        getData()
    },[])

    useEffect(()=>{
        if(!isLoggedIn == null){
            if(isLoggedIn){
                navigation.dispatch(StackActions.replace('health'))
                console.log("Inside Loggein");    
            }
        }
    },[isLoggedIn])

    return(
        <View style={styles.container}>
            <Animated.View 
            entering={BounceInUp.duration(1000)}
            style={styles.shape}>
            </Animated.View>
            <Image
                style={styles.img}
                source={require('../../assets/images/fit2.png')}
            />
            <Link href={'/(auth)'} asChild>
                <Pressable>
                    <View style={styles.titleContainer}>
                    <Text style={styles.title}>Let's Start</Text>
                    </View>
                    <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
                </Pressable>
            </Link>
            <Animated.View 
            entering={BounceInUp.delay(100).duration(1000)}
            style={styles.shapeone}>
            </Animated.View>
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
    shape:{
        flex: 1,
        width:'100%',
        height:'50%',
        backgroundColor: '#FFBF00',
        position:'absolute',
        top:-10,
        left:-100,
        borderRadius:'50%',
    },
    img:{
        height:'50%',
        aspectRatio:1,
        marginTop:100
    },
    titleContainer:{
        marginTop: 20,
        width: 150,
        height:'20%',
        backgroundColor:'#006994',
        borderRadius:20,
        justifyContent:'center',
        alignItems:'center'
    },
    title:{
        fontSize:20,
        color:'white'
    },
    shapeone:{
        flex: 1,
        width:'60%',
        height:'30%',
        backgroundColor: '#FFBF00',
        position:'absolute',
        bottom:-100,
        right:-50,
        borderRadius:'50%'
    }
})