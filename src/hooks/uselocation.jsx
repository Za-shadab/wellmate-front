import { useEffect, useState } from "react";
import * as Location from 'expo-location';

const useLocation = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [location, setLocation] = useState(null);
  const [address , setAddress] = useState('');

  const getUserLocation = async () => {
    // Request permission for foreground location
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Location permission was denied');
      return;
    }
    
    // Fetch current location if permission is granted
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);

    const geocodedAddress = await Location.reverseGeocodeAsync({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    });
    setAddress(geocodedAddress[0].country); // Save the first result
  };

  useEffect(() => {
    getUserLocation(); // Call the function to fetch location when the component mounts
  }, []);

  return { location, address, errorMsg };
};

export default useLocation;
