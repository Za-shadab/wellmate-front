import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';

const { width } = Dimensions.get('window');

const TabBar = ({ state, descriptors, navigation }) => {
  const icons = {
    MealPlan: (color) => <MaterialCommunityIcons name="view-dashboard-outline" size={24} color={color} />,
    Reports: (color) => <Ionicons name="document-text-outline" size={24} color={color} />,
    profile: (color) => <AntDesign name="user" size={24} color={color} />,
    Scanner: (color) => <MaterialCommunityIcons name="qrcode-scan" size={28} color={color} />,
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabbar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;
          
          // Skip rendering system routes
          if (['_sitemap', '+not-found'].includes(route.name)) return null;

          const renderIcon = icons[route.name] || 
            (() => <MaterialCommunityIcons name="help-circle-outline" size={24} color={isFocused ? '#ff9800' : '#7a7a7a'} />);

          const isScanner = route.name === 'Scanner';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={`${label} tab`}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabButton,
                isScanner && styles.scannerButton,
              ]}
            >
              {isScanner ? (
                <View style={styles.scannerIconContainer}>
                  {renderIcon('#ffffff')}
                </View>
              ) : (
                <View style={[
                  styles.regularTabContainer,
                  isFocused && styles.activeTabContainer
                ]}>
                  <View style={styles.iconContainer}>
                    {renderIcon(isFocused ? '#ff9800' : '#7a7a7a')}
                  </View>
                  <Text style={[
                    styles.label, 
                    { color: isFocused ? '#ff9800' : '#7a7a7a' }
                  ]}>
                    {label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 5,
  },
  tabbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
    paddingTop: 12,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  regularTabContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    width: '100%',
    borderRadius: 8,
  },
//   activeTabContainer: {
//     backgroundColor: 'rgba(255, 152, 0, 0.08)',
//   },
  scannerButton: {
    marginTop: -30,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scannerIconContainer: {
    backgroundColor: '#ff9800',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TabBar;