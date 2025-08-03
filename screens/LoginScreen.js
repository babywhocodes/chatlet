import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Button,
} from 'react-native';
import { supabase } from '../supabaseClient';
import { signInWithGoogle } from '../auth';

const LoginScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <ImageBackground
      style={styles.container}
      resizeMode="cover"
      source={require('../assets/whipurp.jpg')}
    >
      <View style={styles.overlay} />
      <View style={styles.card}>
        <Image
          source={require('../assets/favicon.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>CHATLET</Text>
        <Text style={styles.slogan}>Save your time and</Text>
        <Text style={styles.slogan}>ace your exam</Text>

        <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={signInWithGoogle}>
              <Image
                source={require('../assets/google.png')}
                style={styles.googleButton}
              />
            </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
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
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: 12,
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: width * 0.17,
    color: '#5829FF',
    fontWeight: 'bold',
    fontFamily: 'Jaro',
    textShadowColor: 'rgba(92, 83, 255, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 2,
    marginBottom: height * 0.025,
  },
  slogan: {
    fontSize: width * 0.095,
    color: '#5829FF',
    fontWeight: 'bold',
    fontFamily: 'Jaro',
    textShadowColor: 'rgba(92, 83, 255, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: height * 0.05,
    alignItems: 'center',
  },
  googleButton: {
    width: width * 0.9,
    height: height * 0.1,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  loggedInText: {
    fontSize: width * 0.045,
    marginBottom: 10,
    color: '#444',
  },
});

export default LoginScreen;
