import React,{ useContext, useEffect } from 'react';
import { Text, SafeAreaView, StyleSheet, ScrollView, View,TouchableOpacity } from 'react-native';
import { AntDesign, FontAwesome,FontAwesome6 } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

 export default function HelpScreen({navigation}) {
        const { isLight } = useContext(ThemeContext);
  return (
    <SafeAreaView style={[styles.container, isLight ? styles.light : styles.dark]}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Setting')}>
          <AntDesign name="left" size={34}  style={styles.close} />
        </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Chatlet Quick Guide 🚀</Text>

        <View style={styles.section}>
          <Text style={isLight ? styles.textLight : styles.textDark}>
            Sign in with Google, then tap <Text style={styles.bold}>Generate New Flashcard</Text>.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[isLight ? styles.textLight : styles.textDark]}>
            Type a prompt (like <Text style={styles.italic}>"Biology basics"</Text>) and AI builds your deck — title, description, and cards saved locally.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[isLight ? styles.textLight : styles.textDark]}>
            On Home, see your decks with info and date. Tap to review or delete.
          </Text>
          <Text style={[isLight ? styles.textLight : styles.textDark]}>
            No decks yet? You’ll see <Text style={styles.italic}>"No decks found – Create your first deck."</Text>
          </Text>
          <Text style={[isLight ? styles.textLight : styles.textDark]}>
            Pull down to refresh decks. If AI fails, you’ll get an alert.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[isLight ? styles.textLight : styles.textDark]}>
            Use settings (gear icon) for more options.
          </Text>

          <Text style={[isLight ? styles.textLight : styles.textDark]}>for anything else contact the developer.He is chill Guy</Text>
          <Text style={styles.textsupp}> chatlethelp@gmail.com</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Study smarter with Chatlet — flashcards made easy!</Text>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  light: {
    backgroundColor: '#f5f5f5',
  },
  dark: {
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 20,
  },
  close:{
    color:"#5829FF",
    fontSize:40
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
    color: '#5829FF',
    textAlign: 'center',
  },
  section: {
    marginBottom: 18,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  textDark:{
    fontSize: 16,
    lineHeight: 24,
    color: '#ffffff',
  },
  textLight:{
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
  },
  bold: {
    fontWeight: '700',
    color: '#5829FF',
  },
  italic: {
    fontStyle: 'italic',
    color: '#555',
  },
  footer: {
    marginTop: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5829FF',
  },
  textsupp:{
    fontSize: 16,
    color: '#5829FF',
    lineHeight: 24,
  }
});
