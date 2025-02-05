import React,{useState, useEffect} from 'react';
import { StyleSheet, View, Text, Image, ScrollView } from 'react-native';
import { useuserDetailContext } from '../context/UserDetailContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


const UserProfile = () => {
  const { userDetail, updateUserDetail } = useuserDetailContext();
  const [regularId, setRegularId] = useState('');

  useEffect(() => {
    // Fetch user data from AsyncStorage on component mount
    const loadUserData = async () => {
      const storedRegularId = await AsyncStorage.getItem('regularId');
      if (storedRegularId) {
        setRegularId(storedRegularId);
      }
    };
    loadUserData();
  }, []);


  // Sample user data
  const user = {
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+123 456 7890",
    location: "New York, USA",
    profilePhoto: "https://via.placeholder.com/150", // Replace with a real image URL
    height: "180 cm", // Example height
    weight: "75 kg", // Example weight
    bmi: "23.1", // Calculated BMI
    bmr: "1650 kcal/day", // Calculated BMR
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Photo */}
      <View style={styles.photoContainer}>
        <Image
          source={{ uri: user.profilePhoto }}
          style={styles.profilePhoto}
        />
      </View>

      {/* User Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.phone}>{user.phone}</Text>
        <Text style={styles.location}>{user.location}</Text>
      </View>

      {/* Health Metrics */}
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Height:</Text>
          <Text style={styles.metricValue}>{user.height}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Weight:</Text>
          <Text style={styles.metricValue}>{user.weight}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>BMI:</Text>
          <Text style={styles.metricValue}>{user.bmi}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>BMR:</Text>
          <Text style={styles.metricValue}>{user.bmr}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f7f9fc',
  },
  photoContainer: {
    marginBottom: 20,
  },
  profilePhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  phone: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#555',
  },
  metricsContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  metricLabel: {
    fontSize: 16,
    color: '#555',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default UserProfile;
