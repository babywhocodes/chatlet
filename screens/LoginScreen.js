// LoginScreen.js
import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation, onGoogleButtonPress, loading }) => {
  return (
    <ImageBackground
      style={styles.container}
      resizeMode="cover"
      source={require('../assets/whipurp.jpg')}
    >
      <View style={styles.overlay} />
      <View style={styles.card}>
        <Image source={require('../assets/favicon.png')} style={styles.logo} />
        <Text style={styles.title}>CHATLET</Text>
        <Text style={styles.slogan}>Save your time and</Text>
        <Text style={styles.slogan}>ace your exam</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#5829FF" style={styles.loader} />
        ) : (
          <TouchableOpacity onPress={onGoogleButtonPress}>
            <Image
              source={require('../assets/google.png')}
              style={styles.googleButton}
            />
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.05,
    width: '100%',
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: 23,
    marginBottom: height * 0.02,
  },
  title: {
    fontFamily: 'jaro',
    fontSize: 65,
    color: '#5829FF',
  },
  slogan: {
    fontFamily: 'jaro',
    fontSize: 32.5,
    color: '#5829FF',
  },
  googleButton: {
    width: width * 0.75,
    height: height * 0.28,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  loader: {
    marginTop: 20,
  },
});

export default LoginScreen;