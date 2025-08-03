import React, { useContext } from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const FlashcardPreview = ({ flashcards, currentCardIndex, onNext, onPrev, onClose, onSave }) => {
  const { isLight } = useContext(ThemeContext);

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isLight ? styles.light : styles.dark]}>
          {flashcards.length > 0 && (
            <>
              <View style={styles.cardPreviewContainer}>
                <Text style={[styles.cardQuestion, isLight ? styles.textLight : styles.textDark]} selectable>
                  {flashcards[currentCardIndex].question}
                </Text>
                <Text style={[styles.cardAnswer, isLight ? styles.textLight : styles.textDark]} selectable>
                  {flashcards[currentCardIndex].answer}
                </Text>
              </View>
              <Text style={[styles.cardCounter, isLight ? styles.textLight : styles.textDark]}>
                Card {currentCardIndex + 1} of {flashcards.length}
              </Text>
              <View style={styles.navButtons}>
                <Pressable
                  style={[styles.navButton, styles.prevButton]}
                  onPress={onPrev}
                  accessibilityLabel="Previous flashcard"
                >
                  <Text style={styles.navButtonText}>Previous</Text>
                </Pressable>
                <Pressable
                  style={[styles.navButton, styles.nextButton]}
                  onPress={onNext}
                  accessibilityLabel="Next flashcard"
                >
                  <Text style={styles.navButtonText}>Next</Text>
                </Pressable>
              </View>
            </>
          )}
          <View style={styles.modalActionButtons}>
            <Pressable
              style={[styles.modalButton, styles.saveButton]}
              onPress={onSave}
              accessibilityLabel="Save deck"
            >
              <Text style={styles.modalButtonText}>Save Deck</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, styles.closeButton]}
              onPress={onClose}
              accessibilityLabel="Close preview"
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 25,
    width: '100%',
    maxWidth: 500,
  },
  light: {
    backgroundColor: 'white',
  },
  dark: {
    backgroundColor: '#444',
  },
  cardPreviewContainer: {
    minHeight: 200,
    justifyContent: 'center',
    marginBottom: 20,
  },
  cardQuestion: {
    fontFamily: 'Inter-Black',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardAnswer: {
    fontFamily: 'Inter-Black',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  cardCounter: {
    fontFamily: 'Inter-Black',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#fff',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    borderRadius: 6,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  prevButton: {
    backgroundColor: '#6c757d',
  },
  nextButton: {
    backgroundColor: '#5829FF',
  },
  navButtonText: {
    fontFamily: 'Inter-Black',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    borderRadius: 6,
    padding: 12,
    width: '48%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  closeButton: {
    backgroundColor: '#6c757d',
  },
  modalButtonText: {
    fontFamily: 'Inter-Black',
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FlashcardPreview;