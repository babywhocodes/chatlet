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

  const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

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
        {/* ---------- Top bar ---------- */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            style={[
              styles.iconButton,
              isLight ? styles.iconButtonLight : styles.iconButtonDark,
            ]}>
            <AntDesign name="left" size={20} color="#777" />
          </TouchableOpacity>

          <View style={styles.topBarCenter}>
            <Text
              style={[
                styles.deckViewTitle,
                isLight ? styles.textLight : styles.textDark,
              ]}
              numberOfLines={1}>
              {originalDeck.title}
            </Text>
            <Text
              style={[
                styles.deckSubtitle,
                isLight ? styles.subtitleLight : styles.subtitleDark,
              ]}>
              Card {displayIndex} of {currentDeck.cards.length}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleToggleShuffle}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            style={[
              styles.iconButton,
              isLight ? styles.iconButtonLight : styles.iconButtonDark,
            ]}>
            <FontAwesome
              name="random"
              size={18}
              color={isShuffled ? '#5829FF' : '#777'}
            />
          </TouchableOpacity>
        </View>

        {/* ---------- Progress + streak row ---------- */}
        <View style={styles.progressRow}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          {streak > 1 && (
            <View style={styles.streakBadge}>
              <FontAwesome name="fire" size={12} color="#5829FF" />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          )}
        </View>

        {currentDeck.cards.length > 0 ? (
          <View style={styles.cardContainer}>
            <View style={styles.questionCard}>
              <View style={styles.questionCardTop}>
                <Text style={styles.questionLabel}>QUESTION</Text>
                <Text style={styles.questionScore}>
                  Score {score}
                </Text>
              </View>
              <Text
                style={styles.cardText}
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
                let badgeStyle = [
                  styles.optionBadge,
                  isLight ? styles.optionBadgeLight : styles.optionBadgeDark,
                ];
                let badgeTextStyle = isLight
                  ? styles.optionBadgeTextLight
                  : styles.optionBadgeTextDark;
                let textStyle = isLight ? styles.textLight : styles.textDark;
                let icon = null;

                if (showResult) {
                  if (isCorrectOption) {
                    optionStyle = [...optionStyle, styles.correctOption];
                    badgeStyle = [...badgeStyle, styles.correctBadge];
                    badgeTextStyle = styles.textLight1;
                    textStyle = styles.textLight1;
                    icon = (
                      <FontAwesome name="check-circle" size={18} color="#fff" />
                    );
                  } else if (isSelectedOption) {
                    optionStyle = [...optionStyle, styles.wrongOption];
                    badgeStyle = [...badgeStyle, styles.wrongBadge];
                    badgeTextStyle = styles.textLight1;
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
                    <View style={badgeStyle}>
                      <Text style={[styles.optionBadgeText, badgeTextStyle]}>
                        {OPTION_LETTERS[idx]}
                      </Text>
                    </View>
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
                  {currentIndex < currentDeck.cards.length - 1 ? 'Next Question' : 'Finish'}
                </Text>
                <AntDesign
                  name={currentIndex < currentDeck.cards.length - 1 ? 'right' : 'check-circle'}
                  size={16}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
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
      </SafeAreaView>
    );
  };

  const styles = StyleSheet.create({
    container: { flex: 1 },
    paddingTop: 10,
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

    /* ---- Top bar ---- */
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 6,
    },
    iconButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconButtonLight: {
      backgroundColor: '#ffffff',
    },
    iconButtonDark: {
      backgroundColor: '#212121',
    },
    topBarCenter: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 8,
    },
    deckViewTitle: {
      fontFamily: 'jaro',
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    deckSubtitle: {
      fontFamily: 'Inter-Black',
      fontSize: 12,
      marginTop: 2,
    },
    subtitleLight: { color: '#888' },
    subtitleDark: { color: '#999' },

    /* ---- Progress row ---- */
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginTop: 8,
    },
    progressBarContainer: {
      flex: 1,
      height: 6,
      backgroundColor: '#e0e0e0',
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#5829FF',
      borderRadius: 3,
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(88, 41, 255, 0.12)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 10,
    },
    streakText: {
      fontFamily: 'Inter-Black',
      fontSize: 12,
      fontWeight: '700',
      color: '#5829FF',
      marginLeft: 4,
    },

    /* ---- Card area ---- */
    cardContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 22,
    },
    questionCard: {
      width: '100%',
      minHeight: 170,
      borderRadius: 20,
      padding: 24,
      justifyContent: 'center',
      backgroundColor: '#5829FF',
      elevation: 4,
      shadowColor: '#5829FF',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    questionCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    questionLabel: {
      fontFamily: 'Inter-Black',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.5,
      color: 'rgba(255,255,255,0.65)',
    },
    questionScore: {
      fontFamily: 'Inter-Black',
      fontSize: 11,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.65)',
    },
    cardText: {
      fontSize: 17,
      lineHeight: 23,
      textAlign: 'left',
      fontWeight: '600',
      color: '#ffffff',
    },

    /* ---- Options ---- */
    optionsContainer: {
      width: '100%',
      marginTop: 20,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 14,
      marginVertical: 6,
      borderRadius: 14,
    },
    optionLight: {
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
    },
    optionDark: {
      backgroundColor: '#1e1e1e',
    },
    optionBadge: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    optionBadgeLight: {
      backgroundColor: '#f0edff',
    },
    optionBadgeDark: {
      backgroundColor: '#2a2a2a',
    },
    optionBadgeText: {
      fontFamily: 'Inter-Black',
      fontSize: 13,
      fontWeight: '700',
    },
    optionBadgeTextLight: { color: '#5829FF' },
    optionBadgeTextDark: { color: '#b39dff' },
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
    correctBadge: {
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    wrongOption: {
      backgroundColor: '#E53935',
    },
    wrongBadge: {
      backgroundColor: 'rgba(255,255,255,0.25)',
    },

    /* ---- Next button ---- */
    nextButton: {
      flexDirection: 'row',
      backgroundColor: '#5829FF',
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      marginBottom: 12,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextButtonText: {
      fontFamily: 'Inter-Black',
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },

    /* ---- Empty state ---- */
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
  });

  export default TestModeScreen;
