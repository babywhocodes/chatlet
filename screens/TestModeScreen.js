import React, {
    useState,
    useCallback,
    useEffect,
    useContext,
  } from 'react';
  import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    StyleSheet,
  } from 'react-native';
  import { AntDesign, FontAwesome } from '@expo/vector-icons';
  import { ThemeContext } from '../context/ThemeContext';
  
  const TestModeScreen = ({ route, navigation }) => {
    const { isLight } = useContext(ThemeContext);
    const originalDeck = route.params?.deck;
  
    const [currentDeck, setCurrentDeck] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isShuffled, setIsShuffled] = useState(false);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [missedCards, setMissedCards] = useState([]);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
  
    const shuffleArray = (array) => {
      let currentIndex = array.length,
        randomIndex;
      const newArray = [...array];
      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [newArray[currentIndex], newArray[randomIndex]] = [
          newArray[randomIndex],
          newArray[currentIndex],
        ];
      }
      return newArray;
    };
  
    useEffect(() => {
      if (originalDeck?.cards) {
        let cards = [...originalDeck.cards];
        if (isShuffled) {
          cards = shuffleArray(cards);
        }
        cards = cards.map((card) => {
          const allAnswers = originalDeck.cards
            .filter((c) => c.id !== card.id)
            .map((c) => c.answer);
          const wrong = [];
          while (wrong.length < 3 && allAnswers.length > 0) {
            const idx = Math.floor(Math.random() * allAnswers.length);
            wrong.push(allAnswers.splice(idx, 1)[0]);
          }
          const options = [...wrong, card.answer];
          options.sort(() => Math.random() - 0.5);
          return { ...card, options };
        });
        setCurrentDeck({ ...originalDeck, cards });
        setCurrentIndex(0);
        setScore(0);
        setSelected(null);
        setShowResult(false);
        setMissedCards([]);
        setStreak(0);
        setBestStreak(0);
      } else if (!originalDeck) {
        console.warn('TestModeScreen accessed without deck params');
      }
    }, [originalDeck, isShuffled]);
  
    if (!originalDeck) {
      return (
        <SafeAreaView
          style={[styles.container, isLight ? styles.light : styles.dark]}>
          <View style={styles.errorContainer}>
            <AntDesign
              name="exclamationcircleo"
              size={60}
              color={isLight ? '#ccc' : '#666'}
            />
            <Text
              style={[
                styles.errorText,
                isLight ? styles.textLight : styles.textDark,
              ]}>
              No deck found
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Home')}>
              <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
  
    const handleToggleShuffle = () => {
      Alert.alert(
        'Shuffle Cards?',
        'This will reset your current progress in this deck.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Shuffle', onPress: () => setIsShuffled((prev) => !prev) },
        ]
      );
    };
  
    const handleSelect = (option) => {
      if (!showResult) {
        setSelected(option);
        setShowResult(true);
        const correct = currentDeck.cards[currentIndex].answer;
        if (option === correct) {
          setScore((prev) => prev + 1);
          setStreak((prev) => {
            const next = prev + 1;
            setBestStreak((best) => Math.max(best, next));
            return next;
          });
        } else {
          setMissedCards((prev) => [...prev, currentDeck.cards[currentIndex]]);
          setStreak(0);
        }
      }
    };
  
    const handleNext = () => {
      if (currentIndex < currentDeck.cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelected(null);
        setShowResult(false);
      } else {
        const buttons = [
          { text: 'Finish', onPress: () => navigation.navigate('Home') },
        ];
        if (missedCards.length > 0) {
          buttons.unshift({
            text: 'Review Missed',
            onPress: () => {
              setCurrentDeck({ ...originalDeck, cards: missedCards });
              setCurrentIndex(0);
              setScore(0);
              setSelected(null);
              setShowResult(false);
              setMissedCards([]);
              setStreak(0);
            },
          });
        }
        Alert.alert(
          'Test Complete',
          `Score: ${score} / ${currentDeck.cards.length}\nBest streak: ${bestStreak}`,
          buttons
        );
      }
    };
  
    if (!currentDeck) {
      return null; // or loading indicator
    }
  
    const currentCard = currentDeck.cards[currentIndex];
    const progress =
      ((score + missedCards.length) / currentDeck.cards.length) * 100;
    const displayIndex = currentIndex + 1;
  
    return (
      <SafeAreaView
        style={[styles.container, isLight ? styles.light : styles.dark]}>
        <View style={styles.deckHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <AntDesign name="left" size={28} color="#777" />
          </TouchableOpacity>
          <Text
            style={[
              styles.deckViewTitle,
              isLight ? styles.textLight : styles.textDark,
            ]}
            numberOfLines={1}> {originalDeck.title}
          </Text>
          <View style={styles.headerRight}>
            {streak > 1 && (
              <View style={styles.streakBadge}>
                <FontAwesome name="fire" size={13} color="#5829FF" />
                <Text style={styles.streakText}>{streak}</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handleToggleShuffle}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              style={styles.shuffleButton}>
              <FontAwesome
                name="random"
                size={22}
                color={isShuffled ? '#5829FF' : '#777'}
              />
            </TouchableOpacity>
          </View>
        </View>
  
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
  
        {currentDeck.cards.length > 0 ? (
          <View style={styles.cardContainer}>
            <View
              style={[
                styles.questionContainer,
                isLight ? styles.cardFrontLight : styles.cardFrontDark,
              ]}>
              <Text style={styles.questionLabel}>QUESTION</Text>
              <Text
                style={[styles.cardText, styles.textLight1]}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                numberOfLines={5}>
                {currentCard.question}
              </Text>
            </View>
            <View style={styles.optionsContainer}>
              {currentCard.options.map((option, idx) => {
                const isCorrectOption = option === currentCard.answer;
                const isSelectedOption = option === selected;
                let optionStyle = [
                  styles.optionButton,
                  isLight ? styles.optionLight : styles.optionDark,
                ];
                let textStyle = isLight ? styles.textLight : styles.textDark;
                let icon = null;
                if (showResult) {
                  if (isCorrectOption) {
                    optionStyle = [...optionStyle, styles.correctOption];
                    textStyle = styles.textLight1;
                    icon = (
                      <FontAwesome name="check-circle" size={18} color="#fff" />
                    );
                  } else if (isSelectedOption) {
                    optionStyle = [...optionStyle, styles.wrongOption];
                    textStyle = styles.textLight1;
                    icon = (
                      <FontAwesome name="times-circle" size={18} color="#fff" />
                    );
                  }
                }
                return (
                  <TouchableOpacity
                    key={idx}
                    style={optionStyle}
                    onPress={() => handleSelect(option)}
                    disabled={showResult}
                    activeOpacity={0.75}>
                    <Text
                      style={[styles.optionText, textStyle]}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                      numberOfLines={3}>
                      {option}
                    </Text>
                    {icon && <View style={styles.optionIcon}>{icon}</View>}
                  </TouchableOpacity>
                );
              })}
            </View>
            {showResult && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.85}>
                <Text style={styles.nextButtonText}>
                  {currentIndex < currentDeck.cards.length - 1 ? 'Next' : 'Finish'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyDeckContainer}>
            <AntDesign name="inbox" size={60} color={isLight ? '#ccc' : '#666'} />
            <Text
              style={[
                styles.emptyDeckText,
                isLight ? styles.textLight : styles.textDark,
              ]}>
              No cards in this deck
            </Text>
          </View>
        )}
  
        <View style={styles.deckControls}>
          <Text
            style={[
              styles.cardCounter,
              isLight ? styles.textLight : styles.textDark,
            ]}>
            {displayIndex} / {currentDeck.cards.length}
          </Text>
        </View>
      </SafeAreaView>
    );
  };
  
  const styles = StyleSheet.create({
    container: { flex: 1 },
    light: { backgroundColor: '#f5f5f5' },
    dark: { backgroundColor: '#121212' },
    textLight: { color: '#000000' },
    textLight1: { color: '#ffffff' },
    textDark: { color: '#ffffff' },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
    },
    errorText: {
      fontFamily: 'Inter-Black',
      fontSize: 18,
      marginTop: 15,
      marginBottom: 20,
      textAlign: 'center',
    },
    backButton: {
      backgroundColor: '#5829FF',
      borderRadius: 8,
      padding: 12,
      paddingHorizontal: 25,
    },
    backButtonText: {
      fontFamily: 'Inter-Black',
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    deckHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    deckViewTitle: {
      fontFamily: 'jaro',
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      flex: 1,
      marginHorizontal: 10,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    shuffleButton: {
      marginLeft: 10,
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(88, 41, 255, 0.12)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    streakText: {
      fontFamily: 'Inter-Black',
      fontSize: 12,
      fontWeight: '700',
      color: '#5829FF',
      marginLeft: 4,
    },
    cardContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    questionContainer: {
      width: '95%',
      height: 190,
      borderRadius: 14,
      padding: 22,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    cardFrontLight: { 
      backgroundColor: '#5829FF' 
    },
    cardFrontDark: { 
      backgroundColor: '#5829FF' 
    },
    questionLabel: {
      fontFamily: 'Inter-Black',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.5,
      color: 'rgba(255,255,255,0.65)',
      marginBottom: 10,
    },
    cardText: {
      fontSize: 16,
      lineHeight: 22,
      paddingHorizontal: 4,
      textAlign: 'center',
      fontWeight: '600',
    },
    optionsContainer: {
      width: '95%',
      marginTop: 18,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginVertical: 6,
      borderRadius: 10,
    },
    optionLight: {
      backgroundColor: 'white',
    },
    optionDark: {
      backgroundColor: '#212121',
    },
    optionText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: '500',
    },
    optionIcon: {
      marginLeft: 10,
    },
    correctOption: {
      backgroundColor: '#43A047',
    },
    wrongOption: {
      backgroundColor: '#E53935',
    },
    nextButton: {
      backgroundColor: '#5829FF',
      borderRadius: 8,
      padding: 15,
      marginTop: 20,
      width: '95%',
      alignItems: 'center',
    },
    nextButtonText: {
      fontFamily: 'Inter-Black',
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    deckControls: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 20,
    },
    cardCounter: { 
      fontFamily: 'Inter-Black', 
      fontSize: 15, 
      fontWeight: '600' 
    },
    emptyDeckContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
    },
    emptyDeckText: {
      fontFamily: 'Inter-Black',
      fontSize: 18,
      marginTop: 15,
      marginBottom: 20,
      textAlign: 'center',
    },
    progressBarContainer: {
      height: 4,
      backgroundColor: '#e0e0e0',
      marginHorizontal: 20,
      borderRadius: 2,
      marginTop: 10,
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#5829FF',
      borderRadius: 2,
    },
  });
  
  export default TestModeScreen;