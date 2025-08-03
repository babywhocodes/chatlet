import React, { useEffect, useState, useContext } from 'react';
import { ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from '../screens/HomeScreen';
import CreateFlashcardScreen from '../screens/CreateFlashcardScreen';
import ViewDeckScreen from '../screens/ViewDeckScreen';
import SettingScreen from '../screens/SettingScreen';
import LoginScreen from '../screens/LoginScreen';
import { SCREEN_OPTIONS } from '../constants/screenOptions';
import { ThemeContext } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLight } = useContext(ThemeContext);
  const [fontsLoaded] = useFonts({
    'Inter-Black': require('../assets/Black.ttf'),
    jaro: require('../assets/Jaro.ttf'),
  });
  
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setAuthChecked(true);
    };
    
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!fontsLoaded || !authChecked) {
    return <ActivityIndicator size="large" color="#5829FF" style={{ flex: 1 }} />;
  }

  return (
    <NavigationContainer>
      <StatusBar 
        translucent={false} 
        backgroundColor={isLight ? "#fff" : "#000"} 
        barStyle={isLight ? "dark-content" : "light-content"} 
      />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isLight ? 'white' : 'black' },
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Home">
              {(props) => <HomeScreen {...props} isLight={isLight} user={user} />}
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
              name="Setting"
              options={{
                title: 'Settings',
                headerStyle: { backgroundColor: '#5829FF' },
                headerTintColor: '#fff',
                headerShown: false,
              }}
            > 
              {(props) => <SettingScreen {...props} isLight={isLight} user={user} />}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={SCREEN_OPTIONS.LoginScreen}constants
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;