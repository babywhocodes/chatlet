import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import FlashcardPreview from '../components/FlashcardPreview';
import { API_KEY, API_URL, MAX_CARDS, MIN_CARDS, STORAGE_KEY } from '../constants/config';
import { saveDeck as saveDeckToStorage } from '../utils/storage';
import { ThemeContext } from '../context/ThemeContext';

const CreateFlashcardScreen = ({ navigation }) => {
  const { isLight } = useContext(ThemeContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [deckId, setDeckId] = useState(null);

  const validateInputs = useCallback(() => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title');
      return false;
    }
    if (!quantity || isNaN(quantity) || quantity < MIN_CARDS || quantity > MAX_CARDS) {
      Alert.alert('Validation Error', `Please enter a number between ${MIN_CARDS} and ${MAX_CARDS}`);
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description');
      return false;
    }
    return true;
  }, [title, description, quantity]);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setQuantity('5');
    setFlashcards([]);
    setShowPreview(false);
    setCurrentCardIndex(0);
    setDeckId(null);
  }, []);

  const saveDeck = useCallback(async () => {
    try {
      const deck = {
        id: deckId || Date.now(),
        title,
        description,
        cards: flashcards,
        createdAt: new Date().toISOString(),
      };
      await saveDeckToStorage(deck);
      Alert.alert('Success', 'Deck saved successfully!');
      resetForm();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save deck');
    }
  }, [title, description, flashcards, deckId, navigation, resetForm]);

  const generateFlashcards = useCallback(async () => {
    if (!validateInputs()) return;
    setIsLoading(true);

    try {
      const prompt = `Generate exactly ${quantity} flashcards about "${title}" on topic "${description}". 
      Return ONLY a JSON array where each flashcard has:
      - id (number starting from 1)
      - question (string)
      - answer (string)
      
      Example format:
      [{"id":1,"question":"Question text","answer":"Answer text"}]
      
      IMPORTANT: Return ONLY the JSON array with no additional text or markdown formatting.`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 400,
          top_p: 1,
          top_k: 40,
          presence_penalty: 0,
          frequency_penalty: 0,
          temperature: 0.6,
        }),
      });
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response structure');
      }

      const content = data.choices[0].message.content;
      const jsonStart = content.indexOf('[');
      const jsonEnd = content.lastIndexOf(']') + 1;
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No valid JSON array found in response');
      }

      const jsonString = content.slice(jsonStart, jsonEnd);
      const generatedCards = JSON.parse(jsonString);

      const validatedCards = generatedCards.map((card, index) => ({
        id: card.id ?? index + 1,
        question: card.question?.trim() || `Question ${index + 1}`,
        answer: card.answer?.trim() || `Answer ${index + 1}`,
      }));

      setFlashcards(validatedCards);
      setShowPreview(true);
      setCurrentCardIndex(0);
      setDeckId(Date.now());
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to generate flashcards. Please try again.');
    } finally {
      setIsLoading(false);
      setFlashcards(validatedCards);
      setShowPreview(true);
    }
  }, [title, description, quantity, validateInputs]);

  const handleNextCard = useCallback(() => {
    setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
  }, [flashcards.length]);

  const handlePrevCard = useCallback(() => {
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
  }, [flashcards.length]);

  const debouncedSetQuantity = useCallback((text) => {
    const num = text.replace(/[^0-9]/g, '');
    if (num === '') setQuantity('');
    else if (parseInt(num) > MAX_CARDS) setQuantity(MAX_CARDS.toString());
    else if (parseInt(num) < MIN_CARDS) setQuantity(MIN_CARDS.toString());
    else setQuantity(num);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isLight ? styles.light : styles.dark]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.createHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
             <AntDesign name="left" size={34} color="#777"  />
          </TouchableOpacity>
          <Text style={styles.createTitle}>New Flashcard</Text>
      </View>
        <Text style={[styles.inputLabel, isLight ? styles.textLight : styles.textDark]}>Title</Text>
        <TextInput
          style={[styles.input, isLight ? styles.inputLight : styles.inputDark]}
          placeholder="e.g. Biology Terms"
          placeholderTextColor={isLight ? '#999' : '#ccc'}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
          accessibilityLabel="Deck title input"
          returnKeyType="next"
        />

        <Text style={[styles.inputLabel, isLight ? styles.textLight : styles.textDark]}>Description/Topic</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput, isLight ? styles.inputLight : styles.inputDark]}
          placeholder="e.g. Key terms for Biology 101 midterm"
          placeholderTextColor={isLight ? '#999' : '#ccc'}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          accessibility  accessibilityLabel="Deck description input"
          returnKeyType="next"
        />

        <Text style={[styles.inputLabel, isLight ? styles.textLight : styles.textDark]}>Number of Cards ({MIN_CARDS}-{MAX_CARDS})</Text>
        <TextInput
          style={[styles.input, isLight ? styles.inputLight : styles.inputDark]}
          placeholder={`1 - 20`}
          placeholderTextColor={isLight ? '#999' : '#ccc'}
          keyboardType="numeric"
          value={quantity}
          onChangeText={debouncedSetQuantity}
          accessibilityLabel="Number of cards input"
          returnKeyType="done"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.generateButton, isLoading && styles.disabledButton]}
            onPress={generateFlashcards}
            disabled={isLoading}
            accessibilityLabel="Generate flashcards"
            activeOpacity={0.8}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Generating...</Text>
              </>
            ) : (
              <>
                <Text style={styles.buttonText}>✨ Generate Flashcards</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetButton, isLight ? styles.resetButtonLight : styles.resetButtonDark]}
            onPress={resetForm}
            accessibilityLabel="Reset form"
            activeOpacity={0.8}
          >
            
            <FontAwesome name="repeat" size={20} color="#ffffff" />
            <Text style={[styles.resetButtonText, isLight ? styles.textLight : styles.textDark]}>Reset Form</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showPreview && (
        <FlashcardPreview
          flashcards={flashcards}
          currentCardIndex={currentCardIndex}
          onNext={handleNextCard}
          onPrev={handlePrevCard}
          onClose={() => setShowPreview(false)}
          onSave={saveDeck}
        />
      )}
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  createHeader: {
    flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  createTitle: {
    color: '#5829FF',
    fontSize: 34,
    marginLeft: 20,
    fontFamily: 'Inter-Black',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'Inter-Black',
  },
  inputLight: {
    backgroundColor: 'white',
    borderColor: '#ddd',
    color: '#333',
  },
  inputDark: {
    backgroundColor: '#444',
    borderColor: '#555',
    color: '#fff',
  },
  inputLabel: {
    fontFamily: 'Inter-Black',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    marginLeft: 5,
  },
  descriptionInput: {
    minHeight: 120,
  },
  buttonContainer: {
    flexDirection: 'column',
    marginTop: 10,
  },
  generateButton: {
    backgroundColor: '#5829FF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#a18aff',
  },
  resetButton: {
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonLight: {
    backgroundColor: '#e0e0e0',
  },
  resetButtonDark: {
    backgroundColor: '#555',
  },
  buttonText: {
    fontFamily: 'Inter-Black',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resetButtonText: {
    fontFamily: 'Inter-Black',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#fff',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default CreateFlashcardScreen;