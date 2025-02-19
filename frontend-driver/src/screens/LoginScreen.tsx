import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email === 'luan@gmail.com' && password === '123') {
      navigation.navigate('Home');
    } else {
      Alert.alert('Đăng nhập thất bại', 'Email hoặc mật khẩu không đúng');
    }
  };

  return (
    <ImageBackground source={require('../assets/vinhomes.jpeg')} style={styles.background}>
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/driver-logo-removebg-preview.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title}>Vin Shuttle xin chào tài xế</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gmail</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập địa chỉ email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  logoContainer: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
    filter: 'invert(1)'
  },
  title: {
    fontSize: 25,
    color: '#ffffff',
    marginBottom: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 350,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 15,
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#00C000',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});