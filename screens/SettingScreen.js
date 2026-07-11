import React, { useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Button, Alert } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, signOut } from '@react-native-firebase/auth';

const SettingScreen = ({ navigation, user, onSignOut }) => {
  const { isLight, toggleTheme } = useContext(ThemeContext);
  const handleSignOut = async () => {
    try {
      // Show confirmation dialog
      Alert.alert(
        "Confirm Logout",
        "Are you sure you want to logout?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Logout", 
            onPress: async () => {
              try {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
                await signOut(getAuth());
                if (onSignOut) {
                  onSignOut();
                }
              } catch (error) {
                Alert.alert("Error", "Failed to logout. Please try again.");
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "An error occurred during logout.");
    }
  };

  return (
    <View style={[styles.container, isLight ? styles.light : styles.dark]}>
      <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}>
        <AntDesign name="left" size={40} color="#5829FF"  />
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
      <Text style={isLight ? styles.nameLight : styles.nameDark}>{user.displayName} (Free user)</Text>
      <Text style={{ color: 'gray' }}>{user.email}</Text>
    </View>
  </View>
        <TouchableOpacity onPress={toggleTheme} activeOpacity={0.8}>
          <Text style={isLight ? styles.titleLight : styles.titleDark}>
             {isLight ?  '🌙 Dark Mode ' : '☀️ Light Mode ' }
          </Text>
        </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('HelpScreen')}>
        <Text style={isLight ? styles.titleLight : styles.titleDark}>
           <Entypo name="help-with-circle" size={31} color="#5829FF" />  Help
          </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('AboutUsScreen')}>
        <Text style={isLight ? styles.titleLight : styles.titleDark}>
           <AntDesign name="infocirlce" size={35} color="#5829FF" />  About us
        </Text>
        </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('ReportbugScreen')}>
        <Text style={isLight ? styles.titleLight : styles.titleDark}>
           <Entypo name="bug" size={35} color="#5829FF" />  Report Bugs
        </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignOut}>
        <Text style={styles.logout}>
           <Entypo name="log-out" size={35} color="#ff0000" />  Log Out
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
    paddingTop: 7,
    marginBottom: 25,
  },
  headLight: {
    fontFamily: 'jaro',
    fontSize: 42.5,
    fontWeight: '600',
    color: '#5829FF',
  },
  headDark: {
    fontFamily: 'jaro',
    fontSize: 42.5,
    fontWeight: '600',
    color: '#5829FF',
  },
  iconLight:{
    color:'black',
    paddingRight:1
  },
  iconDark:{
    color:'white',
    marginRight:1
  },
  nameLight: {
    color:'black',
    fontWeight:'bold',
    fontSize: 18.5,
    fontFamily: 'jaro',
    marginLeft:'1'
  },
  nameDark:{
    color:'white',
    fontWeight:'bold',
    fontSize: 18.5,
    fontFamily: 'jaro',
    marginLeft:1
  },
  titleLight: {
    fontFamily: 'jaro',
    fontSize: 35,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  titleDark: {
    fontFamily: 'jaro',
    fontSize: 35,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
  },
  logout: {
    fontFamily: 'jaro',
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