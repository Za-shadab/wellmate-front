import { useState } from 'react';
import { Button, Image, View, StyleSheet, Pressable, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ImagePickerExample() {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.mediaTypes.Image,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imgcontainer}>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      </View>
      <Button title="+" onPress={pickImage}/>
      <Pressable  style={styles.button}>
        <Text style={styles.btntext}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgcontainer:{
    width:300,
    height:300,
    backgroundColor:'grey',
    borderRadius:'50%'
  },
  image: {
    width:300,
    aspectRatio:1,
    // resizeMode:'contain',
    borderRadius:150
  },
  button:{
    width:50,
    height:50,
    borderRadius:25,
    backgroundColor:'black',
    justifyContent:'center'
  },
  btntext:{
    color:'white',
    textAlign:'center',
  }
});
