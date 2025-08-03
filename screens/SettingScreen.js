import React, { useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { useFonts } from 'expo-font';
import { ThemeContext } from '../context/ThemeContext';
import { AntDesign } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { supabase } from '../supabaseClient';
import { signInWithGoogle } from '../auth';
import FontAwesome from '@expo/vector-icons/FontAwesome';
const SettingScreen = ({ navigation, user }) => {
  const { isLight, toggleTheme } = useContext(ThemeContext);

  const [fontsLoaded] = useFonts({
    'Inter-Black': require('../assets/Black.ttf'),
    jaro: require('../assets/Jaro.ttf'),
  });
  async function handleLogout() {
    await supabase.auth.signOut();
  }
 

  if (!fontsLoaded) {
    return null; // Render nothing while fonts are loading
  }

  return (
    <View style={[styles.container, isLight ? styles.light : styles.dark]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          hitSlop={{ top: 30, bottom: 20, left: 20, right: 20 }}>
             <AntDesign name="left" size={34} color="#777"  />
        </TouchableOpacity>

        <Text style={isLight ? styles.headLight : styles.headDark}>
          Settings
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
    <FontAwesome name="user-circle" size={70} color="black" style={isLight ? styles.iconLight : styles.iconDark}/>
    <View style={{ marginLeft: '20',}}>
      <Text style={isLight ? styles.nameLight : styles.nameDark}>   {user.user_metadata.name}</Text>
      <Text style={{ color: 'gray' }}>     {user.email}</Text>
    </View>
  </View>
        <TouchableOpacity onPress={toggleTheme} activeOpacity={0.8}>
          <Text style={isLight ? styles.titleLight : styles.titleDark}>
            {isLight ?  '🌙 Dark Mode ' : '☀️ Light Mode ' }
          </Text>
        </TouchableOpacity>

        <Text style={isLight ? styles.titleLight : styles.titleDark}>
           <Entypo name="help-with-circle" size={31} color="#5829FF" />   Help
          </Text>
        <Text style={isLight ? styles.titleLight : styles.titleDark}>
           <AntDesign name="infocirlce" size={35} color="#5829FF" />   About us
        </Text>
        <Text style={isLight ? styles.titleLight : styles.titleDark}>
           <Entypo name="bug" size={35} color="#5829FF" />   Report Bugs
        </Text>
        
        <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.logout}>
           <Entypo name="log-out" size={35} color="#ff0000" />   Log Out
        </Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  light: {
    backgroundColor: '#f5f5f5',
  },
  dark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 25,
    
  },
  headLight: {
    fontFamily: 'Jaro',
    fontSize: 42.5,
    fontWeight: '600',
    color: '#5829FF',
  },
  headDark: {
    fontFamily: 'Jaro',
    fontSize: 42.5,
    fontWeight: '600',
    color: '#5829FF',
  },
  iconLight:{
    color:'black',
    paddingRight:'30'
  },
  iconDark:{
    color:'white',
    marginRight:'30'
  },
  nameLight: {
    color:'black',
    fontWeight:'bold',
    fontSize: 23.5,
    fontFamily: 'Jaro',
    marginLeft:'20'
  },
  nameDark:{
    color:'white',
    fontWeight:'bold',
    fontSize: 23.5,
    fontFamily: 'Jaro',
    marginLeft:'20'
  },
  titleLight: {
    fontFamily: 'Jaro',
    fontSize: 35,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  titleDark: {
    fontFamily: 'Jaro',
    fontSize: 35,
    fontWeight: '600',
    color: '#ffffff',
    margin: '90',
    marginBottom: 20,
  },
  logout: {
    fontFamily: 'Jaro',
    fontSize: 35,
    fontWeight: '600',
    color: '#ff0000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 1,
  },
});

export default SettingScreen;
