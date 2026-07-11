import React,{useEffect} from 'react';
import { ThemeProvider } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import { StatusBar, setStatusBarTranslucent } from 'expo-status-bar';

export default function App() {

useEffect(() => {
  setStatusBarTranslucent(false);
}, []);
  return (
    <>
      <StatusBar translucent={false} backgroundColor="#000"/>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </>
  );
}
