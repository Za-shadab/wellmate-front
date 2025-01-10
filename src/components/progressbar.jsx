import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Progressbar = ({cone, ctwo, cthree, cfour, cfive, csix}) =>{
    const numtocolormap = {
        0: 'black',
        1: 'green'
    }

    return(
        <View style={styles.container}>
            <View style={[styles.viewone, {backgroundColor: numtocolormap[cone]}]}></View>
            <View style={[styles.viewone, {backgroundColor: numtocolormap[ctwo]}]}></View>
            <View style={[styles.viewone, {backgroundColor: numtocolormap[cthree]}]}></View>
            <View style={[styles.viewone, {backgroundColor: numtocolormap[cfour]}]}></View>
            <View style={[styles.viewone, {backgroundColor: numtocolormap[cfive]}]}></View>
            <View style={[styles.viewone, {backgroundColor: numtocolormap[csix]}]}></View>
        </View>
    )
}

export default Progressbar


const styles = StyleSheet.create({
    container:{
        flex:1,
        flexDirection:'row',
        gap:'1%',
        alignItems:'center',
        justifyContent:'center',
        margin:'2%'
    },
    viewone:{
        height:5,
        width:'16%',
        borderRadius:9
    }
})