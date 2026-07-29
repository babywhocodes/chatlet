import React, { useContext } from 'react';
import { ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
// import Subscription from '../screens/Subscription';
import HomeScreen from '../screens/HomeScreen';
import CreateFlashcardScreen from '../screens/CreateFlashcardScreen';
import ViewDeckScreen from '../screens/ViewDeckScreen';
import TestModeScreen from '../screens/TestModeScreen';
import SettingScreen from '../screens/SettingScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
//import LoginScreen from '../screens/LoginScreen';
import HelpScreen from '../screens/HelpScreen';
import ReportbugScreen from '../screens/ReportbugScreen';
import { SCREEN_OPTIONS } from '../constants/screenOptions';
import { ThemeContext } from '../context/ThemeContext';
//import { GoogleSignin } from '@react-native-google-signin/google-signin';
//import { getAuth, GoogleAuthProvider, signInWithCredential, signOut, onAuthStateChanged } from '@react-native-firebase/auth';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLight } = useContext(ThemeContext);
  const [fontsLoaded] = useFonts({
    'Inter-Black': require('../assets/Black.ttf'),
    jaro: require('../assets/Jaro.ttf'),
  });

  // Auth disabled for now — no sign-in required, straight into the app.
  const user = { uid: 'dev-user', displayName: 'tester account' };

  const handleSignOut = async () => {
    // No-op while auth is disabled.
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#5829FF" style={{ flex: 1 }} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isLight ? 'white' : 'black' },
        }}
      >
        
        <Stack.Screen name="Home">
          {(props) => <HomeScreen {...props} isLight={isLight} user={user} onSignOut={handleSignOut} />}
        </Stack.Screen>
        <Stack.Screen
          name="CreateFlashcard"
          component={CreateFlashcardScreen}
          options={SCREEN_OPTIONS.CreateFlashcard}
        />
        <Stack.Screen
          name="ViewDeck"
          component={ViewDeckScreen}
          options={SCREEN_OPTIONS.ViewDeck}
        />

        <Stack.Screen
          name="TestMode"
          component={TestModeScreen}
          options={SCREEN_OPTIONS.ViewDeck}
        />
        <Stack.Screen
          name="Setting"
          options={{
            title: 'Settings',
            headerStyle: { backgroundColor: '#5829FF' },
            headerTintColor: '#fff',
            headerShown: false,
          }}
        >
          {(props) => <SettingScreen {...props} isLight={isLight} user={user} onSignOut={handleSignOut} />}
        </Stack.Screen>
        <Stack.Screen
          name="AboutUsScreen"
          component={AboutUsScreen}
        />
        <Stack.Screen
          name="HelpScreen"
          component={HelpScreen}
          options={SCREEN_OPTIONS.CreateFlashcard}
        />
        <Stack.Screen
          name="ReportbugScreen"
          component={ReportbugScreen}
          options={SCREEN_OPTIONS.CreateFlashcard}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
