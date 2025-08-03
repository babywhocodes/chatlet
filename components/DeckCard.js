import React from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import {AntDesign} from '@expo/vector-icons';
const DeckCard = ({ deck, onPress, onDelete }) => (
  <View style={styles.deckCard}>
    <TouchableOpacity
      style={styles.deckContent}
      onPress={onPress}
      accessibilityLabel={`View deck: ${deck.title}`}
      accessibilityRole="button"
    >
      <Text style={styles.deckTitle} numberOfLines={1} ellipsizeMode="tail">{deck.title}</Text>
      <Text style={styles.deckTopic} numberOfLines={2} ellipsizeMode="tail">{deck.description}</Text>
      <View style={styles.deckFooter}>
        <Text style={styles.deckStats}>
          {deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'}
        </Text>
        <Text style={styles.deckStats}>
          {new Date(deck.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={onDelete}
      accessibilityLabel={`Delete deck: ${deck.title}`}
      accessibilityRole="button"
      hitSlop={10}
    >
      <AntDesign name="delete" size={24} color="#ff4444" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  deckCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal:8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deckContent: {
    flex: 1,
    marginRight: 10,
  },
  deckTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  deckTopic: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  deckFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  deckStats: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
});

export default DeckCard;
