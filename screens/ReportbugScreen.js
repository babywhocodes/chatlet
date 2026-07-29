import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { AntDesign, FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

export default function ReportbugScreen({ navigation }) {
  const { isLight } = useContext(ThemeContext);

  return (
    <View style={isLight ? styles.light : styles.dark}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Setting')}>
        <AntDesign name="left" size={34} style={styles.close} />
      </TouchableOpacity>
      
      <Text style={styles.about}>Report Bug</Text>
      
      <Text style={[isLight ? styles.meLight : styles.meDark]}>Found a Bug?</Text>
      <Text style={[isLight ? styles.meLight : styles.meDark]}>
We’re sorry for the trouble! Please describe the issue you encountered in as much detail as you can — steps to reproduce it, what you expected to happen, and what actually happened. Your feedback helps us make the app better.
</Text>
<Text style={[isLight ? styles.meLight : styles.meDark]}>
Send your bug report to:
</Text>
      <Text style={[isLight ? styles.meLight : styles.meDark]}>chatlethelp@gmail.com</Text>
<Text style={[isLight ? styles.meLight : styles.meDark]}>
Thanks for helping us improve!</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  light: {
    backgroundColor: '#f5f5f5',
    flex: 1,
    paddingTop: 10,
    padding: 8,
  },
  dark: {
    backgroundColor: '#121212',
    flex: 1,
    paddingTop: 10,
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
  meLight: {
    marginTop:20,
    fontFamily: 'jaro',
    color: '#000000',
    fontSize: 19,
  },
  meDark: {
    marginTop:20,
    fontFamily: 'jaro',
    color: '#ffffff',
    fontSize: 19,
  }
});
