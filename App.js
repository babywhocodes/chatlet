import React,{useEffect} from 'react';
import { ThemeProvider } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import { StatusBar, setStatusBarTranslucent } from 'expo-status-bar';
import { useColorScheme } from "react-native";

export default function App() {

  const scheme = useColorScheme(); 
useEffect(() => {
  setStatusBarTranslucent(false);
}, []);
  return (
    <>
    <StatusBar
    translucent={false}
    backgroundColor={scheme === "dark" ? "#000" : "#fff"}
    style={scheme === "dark" ? "light" : "dark"} 
    />
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </>
  );
}
