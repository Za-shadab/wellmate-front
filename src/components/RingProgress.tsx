import {View, Image, StyleSheet, Text, ColorValue, ImageSourcePropType} from 'react-native';
import SVG, { Circle } from 'react-native-svg';
import Animated, {useSharedValue, useAnimatedProps, withTiming} from 'react-native-reanimated'
import {useEffect} from 'react';
import { AntDesign } from '@expo/vector-icons';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type RingProgressProps = {
  radius?: number;
  strokeWidth?: number;
  progress?: number;
  value:  number | String;
  color: ColorValue;
  icon: ImageSourcePropType;
  iconHeight: number;
  labelSize: number;
  icontop: number;
  labeltop: number;
}

// const color = "#EE0F55";
// const color = "#E65100";

const RingProgress = ({radius = 120, strokeWidth = 18, progress = 0.5, value, color="#E65100", icon, iconHeight, labelSize=10, icontop=4.5, labeltop=8}: RingProgressProps) => {
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;

  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(progress, {duration: 1500})
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: [circumference * fill.value, circumference]
  }))

  return (
    <View style={{width: radius * 2, height: radius * 2, alignSelf:'center'}}>
      <SVG style={{flex:1}}>             
        {/* Background */}
        <Circle 
          r={innerRadius}
          cx={radius}
          cy={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          opacity={0.2}
        />

        {/* Foreground */}
        <AnimatedCircle 
          animatedProps={animatedProps}
          r={innerRadius}
          cx={radius}
          cy={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={[circumference * progress, circumference]}
          strokeLinecap="round"
          rotation="-90"
          originX={radius}
          originY={radius}
        />
        </SVG>
        
      <AntDesign
        name="arrowright"
        size={strokeWidth * 0.8}
        color="black"
        style={{
          position: 'absolute',
          alignSelf: 'center',
          top: strokeWidth * 0.1,
        }}
      />
      <Image source={icon} style={{    
        height:iconHeight,
        aspectRatio:1,
        resizeMode:'contain',
        position:'absolute',
        top: strokeWidth * icontop,
        alignSelf:'center'
        }}/>

        <Text style={{    
          fontSize: labelSize,
          fontWeight: '500',
          alignSelf:'center',
          position:'absolute',
          top:strokeWidth * labeltop,
          color:color
          }}>
          {value}
        </Text>
    </View>
  )
}

export default RingProgress;


