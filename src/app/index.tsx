import React,{useState, useEffect} from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform, FlatList,Dimensions} from 'react-native';
import {Link, Redirect} from 'expo-router'
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, BounceOut, BounceInUp,} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, StackActions } from '@react-navigation/native';
import  RootParamList  from './types';
import {Silderdata} from './data';
import { date } from 'yup';




const Onboard = () => {


    const[isLoggedIn, setisLoggedIn] = useState<string | null>(null)
    const navigation = useNavigation();
    const screenwidth = Dimensions.get('window').width;

    async function getData(){
    const data = await AsyncStorage.getItem('isLoggedIn');
    console.log('In _layout.tsx',data);
    setisLoggedIn(data)
    }   
    
    useEffect(()=>{
        getData()
    },[])

    useEffect(()=>{
        if(isLoggedIn !== null && navigation){
            if(isLoggedIn === 'true'){
                console.log("Inside Loggein");
                // navigation.dispatch(StackActions.replace('(tabs)'))
                navigation.dispatch(StackActions.replace('(sliders)'))
            }
        }
    },[isLoggedIn])





    function ImageSlider({ imagesource }: { imagesource: number | { uri: string } }){
        return(
            <Animated.View style={styles.imageContainer}>
            <Animated.Image
            entering={BounceInUp.duration(2000)}
            style={styles.img}
            source={imagesource}
        />
            </Animated.View>
        )
    }

    return(
        <View style={styles.container}>
            <Text>Hello</Text>
            {/* <Animated.FlatList
                data={Silderdata}
                renderItem={({item})=>{
                        return(
                            <ImageSlider imagesource={item.img}/>
                        )
                }}
                keyExtractor={(item)=> item.id.toString()}
                horizontal
                snapToInterval={Dimensions.get('window').width}
                decelerationRate='normal'
            /> */}
            {/* <ImageSlider imagesource={require("../../assets/images/Frame (4).png")}/>

            <Animated.View 
            style={styles.shapeone}>
                <Animated.Text style={styles.weltxt} entering={BounceInUp.delay(100).duration(2000)}>Welcome</Animated.Text>
                <Animated.Text style={styles.txt} entering={BounceInUp.delay(100).duration(2000)}>Your Personalized Wellness Companion along your journey</Animated.Text>
            </Animated.View>


            <Link href={'/health'} asChild>
                <Pressable>
                    <Animated.View style={styles.titleContainer} entering={FadeInDown.delay(200).duration(2000)}>
                    <Animated.Text style={styles.title}>Let's Start</Animated.Text>
                    </Animated.View>
                    <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
                </Pressable>
            </Link> */}
        </View>
    )
}


export default Onboard;

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