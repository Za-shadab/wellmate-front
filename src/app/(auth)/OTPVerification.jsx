import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { URL } from '../../constants/url';
import { useuserDetailContext } from '../context/UserDetailContext';
import { useNutritionistDetailContext } from '../context/NutritionistContext'


export default function OTPVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {};
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(120); // 2 minutes countdown
  const [canResend, setCanResend] = useState(false);

  const { userDetail, updateUserDetail } = useuserDetailContext({});
  const { nutritionistDetail, updateNutritionistDetail } = useNutritionistDetailContext({});
  
  const inputRefs = useRef([]);
  
  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle OTP input change
  const handleOtpChange = (text, index) => {
    if (text.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      
      // Auto-focus to next input
      if (text !== '' && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };
  
  // Handle key press to enable backspace navigation
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1].focus();
    }
  };
  
  // Verify OTP
  const verifyOtp = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${URL}/api/verify-otp`, {
        email,
        otp: otpValue
      });
      
      // Get user role from the response or from route params
      const userType = route.params?.userType || response.data.role || 'regular_user';
      const userId = response.data.userId;
      
      // Navigate based on user type, similar to your registration logic
      if (userType === 'regular_user') {
        updateUserDetail('userId', userId);
        navigation.navigate('(onboard)');
      } else if (userType === 'nutri_user') {
        updateNutritionistDetail('userId', userId);
        navigation.navigate('(nutrionboard)');
      }
      
    } catch (error) {
      Alert.alert(
        'Verification Failed', 
        error.response?.data?.msg || 'Failed to verify OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Resend OTP
  const resendOtp = async () => {
    if (!canResend) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${URL}/api/resend-otp`, { email });
      
      // Reset timer and OTP
      setTimer(120);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      
      Alert.alert('Success', 'A new OTP has been sent to your email');
    } catch (error) {
      Alert.alert(
        'Failed to Resend', 
        error.response?.data?.msg || 'Could not send new OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      
      <Text style={styles.description}>
        We've sent a 6-digit verification code to{'\n'}
        <Text style={styles.email}>{email}</Text>
      </Text>
      
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            ref={(ref) => (inputRefs.current[index] = ref)}
          />
        ))}
      </View>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]}
        onPress={verifyOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.resendContainer}>
        {canResend ? (
          <TouchableOpacity onPress={resendOtp} disabled={loading}>
            <Text style={styles.resendText}>Resend Code</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.timerText}>
            Resend code in {formatTime(timer)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  email: {
    fontWeight: 'bold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    backgroundColor: '#f8f8f8',
  },
  button: {
    backgroundColor: '#006994',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    marginTop: 20,
  },
  resendText: {
    color: '#006994',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerText: {
    color: '#666',
    fontSize: 16,
  },
});