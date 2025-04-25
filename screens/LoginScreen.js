import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Preferences } from '@capacitor/preferences';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const checkLogin = async () => {
      const { value } = await Preferences.get({ key: 'isLoggedIn' });
      if (value === 'true') {
        navigation.navigate('MainLayout');
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    if (email === 'admin' && password === 'dobijan') {
      setError('');
      await Preferences.set({ key: 'isLoggedIn', value: 'true' });
      navigation.navigate('MainLayout');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/images/logo.png')} // Make sure the path is correct
        style={styles.logo}
      />

      {/* Login Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />

      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Login Button */}
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f7',
  },
  logo: {
    width: 170,
    height: 170,
    marginBottom: 25,
    resizeMode: 'contain',
  },
  input: {
    width: '30%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
  },
  loginBtn: {
    backgroundColor: '#6c63ff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '30%',
    marginTop: 10,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
