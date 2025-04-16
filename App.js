import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Navigation from './screens/navigation';
import BudgetPlan from './screens/budgetplan';
import MainLayout from './screens/MainLayout';
import Dashboard from './screens/dashboard';
import Users from './screens/users';
import BudgetDetails from './screens/budgetdetails';
import Notification from './screens/notification';
import LoginScreen from './screens/LoginScreen'; // ✅ import Login
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

const Stack = createStackNavigator();

export default function App() {
  return (
    <View style={styles.container}>
      {/* Header at the Top */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SANGGUNIANG KABATAAN</Text>
        <Text style={styles.headerSubtitle}>BUDGET MONITORING DASHBOARD</Text>
      </View>

      <NavigationContainer style={styles.navigationContainer}>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Login" 
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainLayout" component={MainLayout} />
          <Stack.Screen name="Navigation" component={Navigation} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="BudgetPlan" component={BudgetPlan} />
          <Stack.Screen name="BudgetDetails" component={BudgetDetails} />
          <Stack.Screen name="Users" component={Users} />
          <Stack.Screen name="Notification" component={Notification} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 14,
  },
  navigationContainer: {
    flex: 1,
  },
});
