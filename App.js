import React, { useEffect, useContext } from 'react';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// This inner component can read ThemeContext because it's rendered
// INSIDE ThemeProvider below.
function ThemedStatusBar() {
  const { isLight } = useContext(ThemeContext);

  return (
    <StatusBar
      translucent={false}
      backgroundColor={isLight ? '#fff' : '#000'}
      style={isLight ? 'dark' : 'light'} // 'dark' = dark icons/text, 'light' = white icons/text
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedStatusBar />
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
