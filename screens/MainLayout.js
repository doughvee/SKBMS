import React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Navigation from './navigation'; 
import BudgetPlan from '../screens/budgetplan';
import Dashboard from '../screens/dashboard';
import Users from './users';
import Notification from './notification';
import { Preferences } from '@capacitor/preferences';

const handleLogout = async () => {
  await Preferences.remove({ key: 'isLoggedIn' });
  navigation.navigate('LoginScreen');
};

const Stack = createStackNavigator();

console.log(Stack.Screen);


function ScreenWithSidebar({ children }) {
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <Navigation />

      {/* Main Content Area */}
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </View>
  );
}

function DashboardScreen() {
  return (
    <ScreenWithSidebar>
      <Dashboard />
    </ScreenWithSidebar>
  );
}

function BudgetPlanScreen() {
  return (
    <ScreenWithSidebar>
      <BudgetPlan />
    </ScreenWithSidebar>
  );
}

function UsersScreen() {
  return (
    <ScreenWithSidebar>
      <Users />
    </ScreenWithSidebar>
  );
}

function NotificationScreen() {
  return (
    <ScreenWithSidebar>
      <Notification />
    </ScreenWithSidebar>
  );
}

export default function MainLayout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="BudgetPlan" component={BudgetPlanScreen} />
      <Stack.Screen name="Users" component={UsersScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
    </Stack.Navigator>
  );
}
