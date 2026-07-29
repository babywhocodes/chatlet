import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { AntDesign, FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

export default function AboutUsScreen({ navigation }) {
  const { isLight } = useContext(ThemeContext);
  
  const instagram = () => {
    const url = 'https://instagram.com/babywhocodes';
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };
  
  const linkedin = () => {
    const url = 'https://www.linkedin.com/in/yeselamsew-bekele';
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };
  
  const github = () => {
    const url = 'https://github.com/babywhocodes';
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };
  
  const x = () => {
    const url = 'https://x.com/babywhocodes';
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };

  // Determine icon color based on theme
  const iconColor = isLight ? '#000000' : '#ffffff';

  return (
    <View style={isLight ? styles.light : styles.dark}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Setting')}>
        <AntDesign name="left" size={34} style={styles.close} />
      </TouchableOpacity>
      
      <Text style={styles.about}>About Us</Text>
      
      
      <Text style={[isLight ? styles.meLight : styles.meDark]}>There is no "us" — it's just me. Yeselamsew (Baby) a software developer who builds sleek, user-friendly apps powered by AI. I combine clean design, modern tech, and creative problem-solving to deliver experiences that feel intuitive, innovative, and a little ahead of their time and surely this is just the start.</Text>
      
      <View style={styles.socials}>
        <TouchableOpacity onPress={instagram} style={styles.socialIcon}>
          <FontAwesome name="instagram" size={53} color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={linkedin} style={styles.socialIcon}>
          <FontAwesome name="linkedin-square" size={53} color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={github} style={styles.socialIcon}>
          <FontAwesome name="github" size={53} color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={x} style={styles.socialIcon}>
          <FontAwesome6 name="x-twitter" size={53} color={iconColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  light: {
    paddingTop: 10,
    backgroundColor: '#f5f5f5',
    flex: 1,
    padding: 8,
  },
  dark: {
    paddingTop: 10,
    backgroundColor: '#121212',
    flex: 1,
    padding: 8,
  },
  close: {
    color: "#5829FF",
    fontSize: 40
  },
  about: {
    fontFamily: 'jaro',
    textAlign: 'center',
    fontSize: 38,
    color: '#5829FF',
  },
  logo: {
    height: 208,
    width: 208,
    borderRadius: 150
  },
  logotext: {
    marginTop: 25,
    alignItems: 'center'
  },
  meLight: {
    marginTop:10,
    textAlign:'center',
    fontFamily: 'jaro',
    color: '#000000',
    fontSize: 19,
  },
  meDark: {
    marginTop:10,
    textAlign:'center',
    fontFamily: 'jaro',
    color: '#ffffff',
    fontSize: 19,
  },
  socials: {
    alignItems: 'center',
    marginTop: 35,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  socialIcon: {
    marginHorizontal: 10,
    fontSize: 53
  }
});
