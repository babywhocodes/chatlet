import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { AntDesign } from '@expo/vector-icons';

const DeckCard = ({ deck, onDelete, onFlashcardMode, onTestMode }) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <View style={styles.deckCard}>
      <TouchableOpacity
        style={styles.deckContent}
        onPress={() => setCollapsed(!collapsed)}
        accessibilityLabel={`View deck: ${deck.title}`}
        accessibilityRole="button"
      >
        <Text style={styles.deckTitle} numberOfLines={1} ellipsizeMode="tail">
          {deck.title}
        </Text>
        <Text style={styles.deckTopic} numberOfLines={2} ellipsizeMode="tail">
          {deck.description}
        </Text>
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

     
      <Collapsible collapsed={collapsed}>
        <View style={styles.expandArea}>
          <TouchableOpacity style={styles.optionButton} onPress={onFlashcardMode}>
            <Text style={styles.optionText}>Flashcard Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={onTestMode}>
            <Text style={styles.optionText}>Test Mode</Text>
          </TouchableOpacity>
        </View>
      </Collapsible>
    </View>
  );
};

const styles = StyleSheet.create({
  deckCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  deckContent: {
    flex: 1,
    marginRight: 10
  },
  deckTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333'
  },
  deckTopic: {
    fontSize: 16,
    color: '#666',
    marginTop: 4
  },
  deckFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  deckStats: {
    fontSize: 12,
    color: '#999'
  },
  deleteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 8
  },
  expandArea: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12
  },
  optionButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center'
  }
});

export default DeckCard;
