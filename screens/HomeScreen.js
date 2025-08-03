import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import DeckCard from '../components/DeckCard';
import { loadDecks, deleteDeck } from '../utils/storage';
import { ThemeContext } from '../context/ThemeContext';
import { AntDesign } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';

const HomeScreen = ({ navigation }) => {
  const { isLight } = useContext(ThemeContext);
  const [decks, setDecks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const decksPerPage = 10;
  const fetchDecks = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      const savedDecks = await loadDecks();
      const validDecks = savedDecks.filter(
        (deck) =>
          deck &&
          deck.id &&
          deck.title &&
          deck.description &&
          Array.isArray(deck.cards) &&
          deck.createdAt
      );

      const startIndex = (currentPage - 1) * decksPerPage;
      const paginatedDecks = validDecks.slice(
        startIndex,
        startIndex + decksPerPage
      );

      setDecks((prevDecks) =>
        currentPage === 1 ? paginatedDecks : [...prevDecks, ...paginatedDecks]
      );
      setPage(currentPage);
    } catch (error) {
      Alert.alert('Error', 'Failed to load decks');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDecks(1);
  }, [fetchDecks]);
  const handleLoadMore = useCallback(() => {
    if (!loading) {
      fetchDecks(page + 1);
    }
  }, [fetchDecks, page, loading]);
  const handleDeleteDeck = useCallback(
    (deckId, deckTitle) => {
      deleteDeck(deckId, deckTitle, decks, setDecks);
    },
    [decks]
  );
  const handleViewDeck = useCallback(
    (deck) => {
      if (!deck) {
        console.warn('Attempted to navigate to ViewDeck with undefined deck');
        Alert.alert('Error', 'No deck selected');
        return;
      }
      navigation.navigate('ViewDeck', { deck });
    },
    [navigation]
  );
  const handleSettings = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    navigation.navigate('Setting');
    setTimeout(() => setIsNavigating(false), 1000);
  }, [navigation, isNavigating]);
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#5829FF" />
      </View>
    );
  };
  return (
    <SafeAreaView
      style={[styles.container, isLight ? styles.light : styles.dark]}>
      <View style={styles.header}>
        <Text style={styles.headtext}>CHATLET</Text>
        <TouchableOpacity
          onPress={handleSettings}
          disabled={isNavigating}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <AntDesign name="setting" size={42} color="#5829FF" />
        </TouchableOpacity>
      </View>

      <View style={styles.create}>
        <TouchableOpacity
          style={isLight ? styles.creatorLight : styles.creatorDark}
          onPress={() => navigation.navigate('CreateFlashcard')}>
          <Text style={styles.creatorText}>✨ Generate New Flashcard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyContainer}>
        <Text style={styles.htext}>History ⤷</Text>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          style={{ flex: 1 }}
          scrollEventThrottle={16}
          stickyHeaderIndices={[0]}
          snapToInterval={120}
          snapToAlignment="start"
          decelerationRate="fast">
          {decks.length > 0 ? (
            decks.map((item) => (
              <DeckCard
                key={item.id.toString()}
                deck={item}
                onPress={() => handleViewDeck(item)}
                onDelete={() => handleDeleteDeck(item.id, item.title)}
                minHeight={100}
              />
            ))
          ) : !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No flashcard decks found</Text>
              <Text style={styles.emptySubtext}>
                Create your first deck to get started
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#5829FF',
    borderBottomWidth: 3,
    paddingLeft: 15,
    paddingTop: 18,
    paddingRight: 15,
  },
  headtext: {
    fontFamily: 'jaro',
    fontSize: 45,
    color: '#5829FF',
  },
  create: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  creatorLight: {
    backgroundColor: '#5829FF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  creatorDark: {
    backgroundColor: '#5829FF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  creatorText: {
    fontFamily: 'Inter-Black',
    fontSize: 22,
    color: '#ffffff',
  },
  htext: {
    fontFamily: 'jaro',
    color: '#5829FF',
    fontSize: 27,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontFamily: 'Inter-Black',
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
  emptySubtext: {
    fontFamily: 'Inter-Black',
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
export default HomeScreen;