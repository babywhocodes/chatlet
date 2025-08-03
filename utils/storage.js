import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const saveDeck = async (deck) => {
  try {
    const decks = await loadDecks();
    const updatedDecks = [...decks, deck];
    await AsyncStorage.setItem('decks', JSON.stringify(updatedDecks));
  } catch (error) {
    console.error('Error saving deck:', error);
    throw error;
  }
};

export const loadDecks = async () => {
  try {
    const decksJson = await AsyncStorage.getItem('decks');
    const decks = decksJson ? JSON.parse(decksJson) : [];
    return decks;
  } catch (error) {
    console.error('Error loading decks:', error);
    return [];
  }
};

export const deleteDeck = async (deckId, deckTitle, decks, setDecks) => {
  try {
    const updatedDecks = decks.filter((deck) => deck.id !== deckId);
    await AsyncStorage.setItem('decks', JSON.stringify(updatedDecks));
    setDecks(updatedDecks);
    Alert.alert('Success', 'Deck deleted successfully');
  } catch (error) {
    console.error('Error deleting deck:', error);
    Alert.alert('Error', 'Failed to delete deck');
  }
};