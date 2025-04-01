import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useuserDetailContext } from '../../context/UserDetailContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useNavigation } from 'expo-router';

// This is a mockup of what would normally be provided by the context

export default function UserProfile() {
  const {userDetail} = useuserDetailContext(); 
  const [activeItem, setActiveItem] = useState(null);
  const router = useRouter();
  const navigation = useNavigation();

  const menuItems = [
    { icon: 'droplet', label: 'Glucose', type: 'feather' },
    { icon: 'book-open', label: 'Discover', type: 'feather' },
    { icon: 'trending-up', label: 'Steps', type: 'feather', badge: 'NEW' },
    { icon: 'bar-chart-2', label: 'Progress', type: 'feather' },
    { icon: 'target', label: 'Goals', type: 'feather' },
    { icon: 'heart', label: 'Heart', type: 'feather' },
  ];

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      console.log("Logging out...");
      
      router.replace('/(auth)'); // Redirect to login screen
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleMenuPress = (index) => {
    setActiveItem(index);
    router.navigate(`/Profile/wearablesInsights/${menuItems[index].label.toLowerCase()}`);
  };

  const renderIcon = (item) => {
    if (item.type === 'material') {
      return <MaterialCommunityIcons name={item.icon} size={24} color="#5A67D8" />;
    } else if (item.type === 'ionicons') {
      return <Ionicons name={item.icon} size={24} color="#5A67D8" />;
    }
    return <Feather name={item.icon} size={24} color="#5A67D8" />;
  };  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#5A67D8', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.profileContainer}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: userDetail.profileUrl }}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.avatarBadge} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{userDetail.name}</Text>
              <View style={styles.statusBadge}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.statusGradient}
                >
                  <Text style={styles.statusText}>Premium Member</Text>
                </LinearGradient>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>6</Text>
            <Text style={styles.statLabel}>Weeks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>87</Text>
              <Text style={styles.statPercent}>%</Text>
            </View>
            <Text style={styles.statLabel}>Adherence</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Goals</Text>
          </View>
        </View>

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>MY PROFILE</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.menuItem, 
                index === activeItem && styles.menuItemActive,
                index === menuItems.length - 1 && styles.menuItemLast
              ]}
              onPress={() => handleMenuPress(index)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.menuIconBackground,
                index === activeItem && styles.menuIconBackgroundActive
              ]}>
                {renderIcon(item)}
              </View>
              <Text style={[
                styles.menuLabel,
                index === activeItem && styles.menuLabelActive
              ]}>
                {item.label}
              </Text>
              {item.badge ? (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : (
                <Feather name="chevron-right" size={20} color={index === activeItem ? "#5A67D8" : "#A0AEC0"} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>ACCOUNT</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={()=>{
              router.navigate('/Profile/wearablesInsights/settings');
            }}
          >
            <View style={styles.menuIconBackground}>
              <Feather name="settings" size={24} color="#5A67D8" />
            </View>
            <Text style={styles.menuLabel}>Settings</Text>
            <Feather name="chevron-right" size={20} color="#A0AEC0" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.menuItemLast]}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconBackground}>
              <Feather name="help-circle" size={24} color="#5A67D8" />
            </View>
            <Text style={styles.menuLabel}>Help & Support</Text>
            <Feather name="chevron-right" size={20} color="#A0AEC0" />
          </TouchableOpacity>
        </View>
      
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#5A67D8', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutGradient}
          >
            <Feather name="log-out" size={20} color="#fff" />
            <Text style={styles.logoutText}>Log Out</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 2.1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: 'white',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInfo: {
    marginLeft: 18,
  },
  username: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statusBadge: {
    width: 'auto',
    borderRadius: 20,
    overflow: 'hidden',
  },
  statusGradient: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: -25,
    paddingVertical: 18,
    justifyContent: 'space-around',
    shadowColor: "#4A5568",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 7,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  statPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5A67D8',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#E2E8F0',
  },
  sectionTitle: {
    marginTop: 30,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#718096',
    letterSpacing: 1.2,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    shadowColor: "#4A5568",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemActive: {
    backgroundColor: '#F0F5FF',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconBackground: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIconBackgroundActive: {
    backgroundColor: '#E0E7FF',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
  },
  menuLabelActive: {
    color: '#5A67D8',
    fontWeight: '600',
  },
  badgeContainer: {
    backgroundColor: '#5A67D8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 35,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#5A67D8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  logoutText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    marginTop: 25,
  },
  footerText: {
    fontSize: 12,
    color: '#A0AEC0',
  },
});