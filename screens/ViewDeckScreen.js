import React, {
  useState,
  useCallback,
  useEffect,
  useContext,
  useRef,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import Swiper from '../components/Swiper';
import FlipCard from 'react-native-flip-card';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { ThemeContext } from '../context/ThemeContext';

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 34;
const FONT_STEP = 2;
const AUTOPLAY_INTERVAL_MS = 4000;

const ViewDeckScreen = ({ route, navigation }) => {
  const { isLight } = useContext(ThemeContext);
  const originalDeck = route.params?.deck;

  const [currentDeck, setCurrentDeck] = useState(originalDeck);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardsToReview, setCardsToReview] = useState([]);

  const swiperRef = useRef(null);
  const [isShuffled, setIsShuffled] = useState(false);

  // --- New feature state ---
  const [starredIds, setStarredIds] = useState(new Set());
  const [showOnlyStarred, setShowOnlyStarred] = useState(false);
  const [firstSide, setFirstSide] = useState('question'); // 'question' | 'answer'
  const [flippedMap, setFlippedMap] = useState({}); // cardId -> boolean (per-card flip state)
  const [fontSize, setFontSize] = useState(22);
  const [autoplay, setAutoplay] = useState(false);
  const [jumpModalVisible, setJumpModalVisible] = useState(false);
  const [jumpValue, setJumpValue] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  // True while the user is going back through cards they previously
  // swiped left on ("study again").
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Bumped whenever something changes that the Swiper needs to visually
  // reflect but that wouldn't otherwise change its `key` (e.g. toggling a
  // star, or re-shuffling/filtering while sitting on the same card index).
  const [renderKey, setRenderKey] = useState(0);

  const autoplayIntervalRef = useRef(null);

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
      let cards = originalDeck.cards;
      if (showOnlyStarred) {
        cards = cards.filter((c) => starredIds.has(c.id));
      }
      if (isShuffled) {
        cards = shuffleArray(cards);
      }
      setCurrentDeck({ ...originalDeck, cards });
      setCurrentCardIndex(0);
      setCardsToReview([]);
      setFlippedMap({});
      setIsReviewMode(false);
      setRenderKey((k) => k + 1);
    } else if (!originalDeck) {
      console.warn('ViewDeckScreen accessed without deck params');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalDeck, isShuffled, showOnlyStarred]);

  // Stop autoplay if it's running and the deck becomes empty / unmounts
  useEffect(() => {
    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
    if (autoplay && currentDeck?.cards?.length > 0) {
      autoplayIntervalRef.current = setInterval(() => {
        if (swiperRef.current) {
          swiperRef.current.swipeRight();
        }
      }, AUTOPLAY_INTERVAL_MS);
    }
    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, currentCardIndex, currentDeck]);

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

  const onSwiped = useCallback((index) => {
    setCurrentCardIndex(index + 1);
  }, []);

  const onSwipedLeft = useCallback(
    (index) => {
      const card = currentDeck.cards[index];
      setCardsToReview((prev) => {
        if (!prev.some((c) => c.id === card.id)) {
          return [...prev, card];
        }
        return prev;
      });
    },
    [currentDeck.cards]
  );

  const onSwipedRight = useCallback(() => {}, []);

  // Starts (or restarts) a study round made up only of the cards currently
  // marked "study again". Used both by the end-of-deck prompt and by the
  // "Review missed cards" menu option, so it can be triggered any time
  // there are cards waiting to be reviewed.
  const startReviewSession = useCallback(() => {
    if (cardsToReview.length === 0) return;
    setAutoplay(false);
    setIsReviewMode(true);
    setCurrentDeck({ ...originalDeck, cards: cardsToReview });
    setCurrentCardIndex(0);
    setCardsToReview([]);
    setFlippedMap({});
    setRenderKey((k) => k + 1);
  }, [cardsToReview, originalDeck]);

  const onSwipedAll = useCallback(() => {
    setAutoplay(false);
    if (cardsToReview.length > 0) {
      Alert.alert(
        'Review Cards?',
        `You have ${cardsToReview.length} card(s) marked for review. Would you like to study them again?`,
        [
          {
            text: 'Review',
            onPress: startReviewSession,
          },
          {
            text: 'Done',
            onPress: () => {
              setIsReviewMode(false);
              navigation.navigate('Home');
            },
          },
        ]
      );
    } else {
      setIsReviewMode(false);
      Alert.alert('All Done!', "You've gone through all the cards.", [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    }
  }, [navigation, cardsToReview, startReviewSession]);

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

  const handleToggleStarFilter = () => {
    setShowOnlyStarred((prev) => !prev);
  };

  const handleToggleFirstSide = () => {
    setFirstSide((prev) => (prev === 'question' ? 'answer' : 'question'));
  };

  const handleToggleAutoplay = () => {
    setAutoplay((prev) => !prev);
  };

  const handleFontIncrease = () => {
    setFontSize((prev) => Math.min(prev + FONT_STEP, MAX_FONT_SIZE));
  };

  const handleFontDecrease = () => {
    setFontSize((prev) => Math.max(prev - FONT_STEP, MIN_FONT_SIZE));
  };

  const toggleStar = useCallback((cardId) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
    setRenderKey((k) => k + 1);
  }, []);

  const handleFlipEnd = useCallback((cardId, flipped) => {
    setFlippedMap((prev) => ({ ...prev, [cardId]: flipped }));
  }, []);

  const handleRestart = () => {
    setAutoplay(false);
    setCurrentCardIndex(0);
    setCardsToReview([]);
    setFlippedMap({});
    setIsReviewMode(false);
  };

  const handleJumpToCard = () => {
    const num = parseInt(jumpValue, 10);
    if (!isNaN(num) && currentDeck?.cards?.length > 0) {
      const clamped = Math.max(1, Math.min(num, currentDeck.cards.length));
      setAutoplay(false);
      setCurrentCardIndex(clamped - 1);
    }
    setJumpModalVisible(false);
    setJumpValue('');
  };

  const renderCard = useCallback(
    (card) => {
      if (!card) return <View style={styles.flipCard} />;
      const flipped =
        flippedMap[card.id] !== undefined
          ? flippedMap[card.id]
          : firstSide === 'answer';
      const starred = starredIds.has(card.id);
      return (
        <FlipCard
          style={styles.flipCard}
          friction={8}
          perspective={2000}
          flipHorizontal
          flipVertical={false}
          clickable
          flip={flipped}
          onFlipEnd={(f) => handleFlipEnd(card.id, f)}>
          {/* Card Front (question, unless firstSide flips this) */}
          <SafeAreaView style={styles.cardFace}>
            <TouchableOpacity
              style={styles.starButton}
              onPress={() => toggleStar(card.id)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <FontAwesome
                name={starred ? 'star' : 'star-o'}
                size={24}
                color="#FFD700"
              />
            </TouchableOpacity>
            <Text style={[styles.cardText, styles.textLight1, { fontSize }]}>
              {card.question}
            </Text>
            <View style={styles.cardHintContainer}>
              <Text style={[styles.cardHint, styles.textLight1]}>
                Tap to see answer
              </Text>
              <FontAwesome name="repeat" size={20} color="#ffffff" />
            </View>
          </SafeAreaView>
          {/* Card Back */}
          <SafeAreaView
            style={[
              styles.cardFace,
              isLight ? styles.cardFrontLight : styles.cardFrontDark,
            ]}>
            <TouchableOpacity
              style={styles.starButton}
              onPress={() => toggleStar(card.id)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
             <FontAwesome
                name={starred ? 'star' : 'star-o'}
                size={24}
                color="#FFD700"
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.cardText,
                isLight ? styles.textLight : styles.textDark,
                { fontSize },
              ]}>
              {card.answer}
            </Text>
            <View style={styles.cardHintContainer}>
              <Text
                style={[
                  styles.cardHint,
                  isLight ? styles.textLight : styles.textDark,
                ]}>
                Tap to see question
              </Text>
              <FontAwesome
                name="repeat"
                size={20}
                style={[isLight ? styles.repeatLight : styles.repeatDark]}
              />
            </View>
          </SafeAreaView>
        </FlipCard>
      );
    },
    [isLight, flippedMap, starredIds, firstSide, toggleStar, handleFlipEnd]
  );

  const progress =
    currentDeck?.cards.length > 0
      ? (currentCardIndex / currentDeck.cards.length) * 100
      : 0;
  const displayIndex = Math.min(
    currentCardIndex + 1,
    currentDeck?.cards.length || 0
  );

  return (
    <SafeAreaView
      style={[styles.container, isLight ? styles.light : styles.dark]}>
      <View style={styles.deckHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <AntDesign name="left" size={34} color="#777" />
        </TouchableOpacity>
        <Text
          style={[
            styles.deckViewTitle,
            isLight ? styles.textLight : styles.textDark,
          ]}
          numberOfLines={1}>
          {originalDeck.title}
        </Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <FontAwesome name="ellipsis-h" size={26} color="#777" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {currentDeck.cards.length > 0 ? (
        <>
          <View style={styles.cardContainer}>
            <Swiper
              key={`${currentCardIndex}-${renderKey}`}
              ref={swiperRef}
              cards={currentDeck.cards}
              renderCard={renderCard}
              onSwiped={onSwiped}
              onSwipedLeft={onSwipedLeft}
              onSwipedRight={onSwipedRight}
              onSwipedAll={onSwipedAll}
              cardIndex={currentCardIndex}
              backgroundColor="transparent"
              stackSize={3}
              verticalSwipe={false}
              disableTopSwipe
              disableBottomSwipe
              overlayLabels={{
                left: {
                  element: (
                    <View style={styles.swipeLabelLeft}>
                      <Text style={styles.swipeLabelText}>STUDY AGAIN</Text>
                    </View>
                  ),
                  style: {
                    wrapper: {
                      alignItems: 'flex-end',
                      marginTop: 30,
                      marginLeft: -30,
                    },
                  },
                },
                right: {
                  element: (
                    <View style={styles.swipeLabelRight}>
                      <Text style={styles.swipeLabelText}>GOT IT!</Text>
                    </View>
                  ),
                  style: {
                    wrapper: {
                      alignItems: 'flex-start',
                      marginTop: 30,
                      marginLeft: 30,
                    },
                  },
                },
              }}
              animateOverlayLabelsOpacity
              animateCardOpacity
              containerStyle={styles.swiperContainer}
            />
          </View>

          <View style={styles.deckControls}>
            <Text
              style={[
                styles.cardCounter,
                isLight ? styles.textLight : styles.textDark,
              ]}>
              {displayIndex} / {currentDeck.cards.length}
            </Text>
            {isReviewMode ? (
              <Text style={styles.reviewBadge}>Reviewing missed cards</Text>
            ) : (
              cardsToReview.length > 0 && (
                <Text style={styles.reviewBadge}>
                  {cardsToReview.length} to review
                </Text>
              )
            )}
          </View>
        </>
      ) : (
        <View style={styles.emptyDeckContainer}>
          <AntDesign name="inbox" size={60} color={isLight ? '#ccc' : '#666'} />
          <Text
            style={[
              styles.emptyDeckText,
              isLight ? styles.textLight : styles.textDark,
            ]}>
            {showOnlyStarred
              ? 'No starred cards yet'
              : 'No cards in this deck'}
          </Text>
          {showOnlyStarred && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowOnlyStarred(false)}>
              <Text style={styles.backButtonText}>Show All Cards</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Jump to card modal */}
      <Modal
        visible={jumpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setJumpModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              isLight ? styles.light : styles.dark,
            ]}>
            <Text
              style={[
                styles.modalTitle,
                isLight ? styles.textLight : styles.textDark,
              ]}>
              Jump to Card
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                isLight ? styles.textLight : styles.textDark,
              ]}
              keyboardType="number-pad"
              placeholder={`1 - ${currentDeck.cards.length}`}
              placeholderTextColor="#999"
              value={jumpValue}
              onChangeText={setJumpValue}
              autoFocus
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setJumpModalVisible(false);
                  setJumpValue('');
                }}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleJumpToCard}>
                <Text style={styles.modalButtonText}>Go</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Options menu (three-dot button) */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.menuContent, isLight ? styles.light : styles.dark]}>
            <Text
              style={[
                styles.modalTitle,
                isLight ? styles.textLight : styles.textDark,
              ]}>
              Options
            </Text>

            <View style={styles.menuRow}>
              <View style={styles.menuRowLabel}>
                <FontAwesome
                  name="random"
                  size={18}
                  color={isLight ? '#555' : '#ccc'}
                />
                <Text
                  style={[
                    styles.menuRowText,
                    isLight ? styles.textLight : styles.textDark,
                  ]}>
                  Shuffle cards
                </Text>
              </View>
              <Switch
                value={isShuffled}
                onValueChange={() => {
                  setMenuVisible(false);
                  handleToggleShuffle();
                }}
                trackColor={{ true: '#5829FF' }}
              />
            </View>

            <View style={styles.menuRow}>
              <View style={styles.menuRowLabel}>
                <FontAwesome name="star-o" size={18} color="#FFD700" />
                <Text
                  style={[
                    styles.menuRowText,
                    isLight ? styles.textLight : styles.textDark,
                  ]}>
                  Starred only
                </Text>
              </View>
              <Switch
                value={showOnlyStarred}
                onValueChange={handleToggleStarFilter}
                trackColor={{ true: '#5829FF' }}
              />
            </View>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={handleToggleFirstSide}>
              <View style={styles.menuRowLabel}>
                <AntDesign
                  name="swap"
                  size={18}
                  color={isLight ? '#555' : '#ccc'}
                />
                <Text
                  style={[
                    styles.menuRowText,
                    isLight ? styles.textLight : styles.textDark,
                  ]}>
                  Starting side
                </Text>
              </View>
              <Text
                style={[
                  styles.menuRowValue,
                  isLight ? styles.textLight : styles.textDark,
                ]}>
                {firstSide === 'question' ? 'Term first' : 'Def first'}
              </Text>
            </TouchableOpacity>

            <View style={styles.menuRow}>
              <View style={styles.menuRowLabel}>
                <FontAwesome
                  name={autoplay ? 'pause' : 'play'}
                  size={16}
                  color={isLight ? '#555' : '#ccc'}
                />
                <Text
                  style={[
                    styles.menuRowText,
                    isLight ? styles.textLight : styles.textDark,
                  ]}>
                  Autoplay
                </Text>
              </View>
              <Switch
                value={autoplay}
                onValueChange={handleToggleAutoplay}
                trackColor={{ true: '#5829FF' }}
              />
            </View>



            <TouchableOpacity
              style={styles.menuRow}
              disabled={cardsToReview.length === 0}
              onPress={() => {
                setMenuVisible(false);
                startReviewSession();
              }}>
              <View style={styles.menuRowLabel}>
                <FontAwesome
                  name="refresh"
                  size={16}
                  color={
                    cardsToReview.length === 0
                      ? isLight
                        ? '#ccc'
                        : '#555'
                      : isLight
                      ? '#555'
                      : '#ccc'
                  }
                />
                <Text
                  style={[
                    styles.menuRowText,
                    isLight ? styles.textLight : styles.textDark,
                    cardsToReview.length === 0 && styles.menuRowTextDisabled,
                  ]}>
                  Review missed cards
                </Text>
              </View>
              <Text
                style={[
                  styles.menuRowValue,
                  isLight ? styles.textLight : styles.textDark,
                ]}>
                {cardsToReview.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                setMenuVisible(false);
                handleRestart();
              }}>
              <View style={styles.menuRowLabel}>
                <AntDesign
                  name="reload"
                  size={18}
                  color={isLight ? '#555' : '#ccc'}
                />
                <Text
                  style={[
                    styles.menuRowText,
                    isLight ? styles.textLight : styles.textDark,
                  ]}>
                  Restart deck
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuRow, styles.menuRowLast]}
              onPress={() => {
                setMenuVisible(false);
                setJumpModalVisible(true);
              }}>
              <View style={styles.menuRowLabel}>
                <FontAwesome
                  name="list-ol"
                  size={16}
                  color={isLight ? '#555' : '#ccc'}
                />
                <Text
                  style={[
                    styles.menuRowText,
                    isLight ? styles.textLight : styles.textDark,
                  ]}>
                  Jump to card
                </Text>
              </View>
              <AntDesign
                name="right"
                size={14}
                color={isLight ? '#999' : '#666'}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  light: { backgroundColor: '#f5f5f5' },
  dark: { backgroundColor: '#121212' },
  textLight: { color: '#000' },
  paddingTop: 10,
  textLight1: { color: '#ffffff' },
  textDark: { color: '#fff' },
  repeatLight: { color: 'black' },
  repeatDark: { color: 'white' },
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
    marginTop: 10,
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
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  menuContent: {
    width: '85%',
    borderRadius: 14,
    padding: 20,
    alignItems: 'stretch',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(120,120,120,0.3)',
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuRowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuRowText: {
    fontSize: 15,
    marginLeft: 10,
  },
  menuRowValue: {
    fontSize: 14,
    opacity: 0.7,
  },
  fontStepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(120,120,120,0.3)',
    marginHorizontal: 12,
  },
  fontChipText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  cardContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     height:'130%',
     marginTop:'10%'
    },
  flipCard: { width: '95%', height: '230%', alignSelf: 'center', borderWidth: 0 },
  cardFace: {
    flex: 1,
    height: '130%',
    borderRadius: 12,
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: '#5829FF',
  },
  cardFrontLight: {
    backgroundColor: 'white',
    height: '130%'
  },
  cardFrontDark: {
    backgroundColor: '#1c1c1c',
    height: '130%'
  },
  cardText: {
    fontSize: 22,
    padding: 5,
    textAlign: 'center',
    fontWeight: '500',
  },
  cardHintContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.7,
  },
  cardHint: {
   fontFamily: 'Inter-Black',
   fontSize: 14,
   marginRight: 5 },
  swiperContainer: { flex: 1 },
  swipeLabelLeft: {
    backgroundColor: '#E53935',
    padding: 10,
    borderRadius: 5,
    transform: [{ rotate: '15deg' }],
  },
  swipeLabelRight: {
    backgroundColor: '#43A047',
    padding: 10,
    borderRadius: 5,
    transform: [{ rotate: '-15deg' }],
  },
  swipeLabelText: {
    fontFamily: 'Inter-Black',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
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
  fontSize: 18,
  fontWeight: '600' },
  reviewBadge: {
    fontFamily: 'Inter-Black',
    fontSize: 13,
    fontWeight: '600',
    color: '#5829FF',
  },
  menuRowTextDisabled: {
    opacity: 0.4,
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
  starButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Inter-Black',
    fontSize: 18,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#777',
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#5829FF',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ViewDeckScreen;
