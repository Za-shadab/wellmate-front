import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable,Image } from 'react-native';

import Colors from '@/src/constants/Colors';
import { useColorScheme } from '@/src/components/useColorScheme';
import { useClientOnlyValue } from '@/src/components/useClientOnlyValue';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import TabBar from '@/src/components/TabBar';
import {MealPlanProvider} from '@/src/app/context/MealPlanContext';
import { ScannerProvider } from '@/src/app/context/scannerContext';
import useHealthData from '@/src/hooks/usehealthdata';


const client = new ApolloClient({
  uri: 'https://haghela.us-east-a.ibm.stepzen.net/api/dull-moth/__graphql',
  cache: new InMemoryCache(),
  headers: {
    Authorization:'apikey haghela::local.net+1000::c9084a97d66e6c12abc49f282a3df351242c6a18ffb00473f53d358089745c63'
  },
});


// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const healthData = useHealthData();
  
  return (
    <ApolloProvider client={client}>
    <MealPlanProvider>
    <ScannerProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
      tabBar = {props => <TabBar {...props}/>}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerShown:false,
        }}
      />
      <Tabs.Screen
        name="FoodLog"
        options={{
          headerShown:false,
          title: 'logs',
        }}
      />
        <Tabs.Screen
          name="two"
          options={{
            headerShown:false,
            title: 'logs',
          }}
        />
      <Tabs.Screen
        name='mealplan'
        options={{
          title:'plans',
          headerShown:false
        }}
      />
      <Tabs.Screen
        name='Profile'
        options={{
          title:'profile',
          headerShown:false,
        }}
      />
    </Tabs>
    </ScannerProvider>
    </MealPlanProvider>
    </ApolloProvider>
  );
}
