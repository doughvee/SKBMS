import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function Navigation() {
  const navigation = useNavigation();
  const route = useRoute();
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      {/* Hamburger Menu */}
      <TouchableOpacity
        onPress={() => setIsVisible(!isVisible)}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 50,
          padding: 8,
        }}
      >
        <View style={{ width: 20, height: 3, backgroundColor: isVisible ? 'white' : 'black', marginBottom: 4 }} />
        <View style={{ width: 20, height: 3, backgroundColor: isVisible ? 'white' : 'black', marginBottom: 4 }} />
        <View style={{ width: 20, height: 3, backgroundColor: isVisible ? 'white' : 'black' }} />
      </TouchableOpacity>

      {/* Sidebar */}
      {isVisible && (
        <View
          style={{
            width: 220,
            backgroundColor: '#333',
            padding: 20,
            borderRightWidth: 1,
            borderColor: 'gray',
            height: '100%',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <View>
            <Image
              source={require('../assets/images/logo.png')}
              style={{
                width: 100,
                height: 100,
                borderRadius: 75,
                marginBottom: 20,
                marginLeft: 30,
                marginTop: 25,
              }}
            />

            {/* Menu Items */}
            {[
              { title: 'Dashboard', icon: 'view-dashboard', screen: 'Dashboard' },
              { title: 'Manage Budget Plans', icon: 'finance', screen: 'BudgetPlan' },
              { title: 'Manage Users', icon: 'account-group', screen: 'Users' },
              { title: 'Notification', icon: 'bell', screen: 'Notification' },
            ].map((item) => (
              <TouchableOpacity
                key={item.screen}
                onPress={() => navigation.navigate(item.screen)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 15,
                  backgroundColor: route.name === item.screen ? '#A7C7E7' : 'transparent',
                  padding: 10,
                  borderRadius: 5,
                }}
              >
                <MaterialCommunityIcons name={item.icon} size={20} color="white" style={{ marginRight: 10 }} />
                <Text style={{ color: 'white' }}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
              borderRadius: 5,
              backgroundColor: '#333',
            }}
          >
            <MaterialCommunityIcons name="logout" size={20} color="white" style={{ marginRight: 10 }} />
            {/* <Text style={{ color: 'White' }}>Logout</Text> */}
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}
