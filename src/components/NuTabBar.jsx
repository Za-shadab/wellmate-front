import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';

const { width } = Dimensions.get('window');

const TabBar = ({ state, descriptors, navigation }) => {
  const icons = {
    dashboard: (color) => <MaterialCommunityIcons name="view-dashboard-outline" size={24} color={color} />,
    planner: (color) => <Ionicons name="document-text-outline" size={24} color={color} />,
    savedplanner: (color) => <Ionicons name="clipboard-outline" size={32} color={color} />,
    nutriprofile: (color) => <AntDesign name="user" size={24} color={color} />,
  };

  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;
        const color = isFocused ? '#ff9800' : '#7a7a7a';

        // Ensure the route name is valid and avoid undefined issues
        const renderIcon = icons[route.name] || (() => <MaterialCommunityIcons name="help-circle-outline" size={24} color={color} />);

        if (['_sitemap', '+not-found'].includes(route.name)) return null;

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

        const isScanner = route.name === 'Scanner';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              styles.tabButton,
              isScanner && styles.scannerButton,
              isFocused && styles.focusedButton
            ]}
          >
            <View style={[styles.iconContainer, isScanner && styles.scannerIconContainer]}>
              {renderIcon(isScanner ? '#ffffff' : color)}
            </View>
            {!isScanner && <Text style={[styles.label, { color }]}>{label}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingBottom: 20,
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
  },
  focusedButton: {
    transform: [{ scale: 1.1 }],
  },
  scannerButton: {
    transform: [{ translateY: -20 }],
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerIconContainer: {
    backgroundColor: '#ff9800',
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#ff9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default TabBar;