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
} from 'react-native';
import Swiper from '../components/Swiper';
import FlipCard from 'react-native-flip-card';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

const ViewDeckScreen = ({ route, navigation }) => {
  const { isLight } = useContext(ThemeContext);
  const originalDeck = route.params?.deck;

  const [currentDeck, setCurrentDeck] = useState(originalDeck);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsToReview, setCardsToReview] = useState([]);

  const swiperRef = useRef(null);
  const [isShuffled, setIsShuffled] = useState(false);

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
      const newCards = isShuffled
        ? shuffleArray(originalDeck.cards)
        : originalDeck.cards;
      setCurrentDeck({ ...originalDeck, cards: newCards });
      setCurrentCardIndex(0);
      setCardsToReview([]);
      setIsFlipped(false);
    } else if (!originalDeck) {
      console.warn('ViewDeckScreen accessed without deck params');
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

  const onSwiped = useCallback((index) => {
    setIsFlipped(false);
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

  const onSwipedAll = useCallback(() => {
    setIsFlipped(false);
    if (cardsToReview.length > 0) {
      Alert.alert(
        'Review Cards?',
        `You have ${cardsToReview.length} card(s) marked for review. Would you like to study them again?`,
        [
          {
            text: 'Review',
            onPress: () => {
              setCurrentDeck({ ...originalDeck, cards: cardsToReview });
              setCurrentCardIndex(0);
              setCardsToReview([]);
            },
          },
          { text: 'Done', onPress: () => navigation.navigate('Home') },
        ]
      );
    } else {
      Alert.alert('All Done!', "You've gone through all the cards.", [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    }
  }, [navigation, cardsToReview, originalDeck]);

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

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (swiperRef.current && currentCardIndex < currentDeck.cards.length) {
      swiperRef.current.swipeRight();
    }
  };

  const renderCard = useCallback(
    (card) => {
      if (!card) return <View style={styles.flipCard} />;
      return (
        <FlipCard
          style={styles.flipCard}
          friction={8}
          perspective={2000}
          flipHorizontal
          flipVertical={false}
          clickable>
          {/* Card Front */}
          <SafeAreaView style={styles.cardFace}>
            <Text style={[styles.cardText, styles.textLight1]}>
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
            <Text
              style={[
                styles.cardText,
                isLight ? styles.textLight : styles.textDark,
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
    [isLight]
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
          onPress={handleToggleShuffle}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <FontAwesome
            name="random"
            size={28}
            color={isShuffled ? '#5829FF' : '#777'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {currentDeck.cards.length > 0 ? (
        <>
          <View style={styles.cardContainer}>
            <Swiper
              key={currentCardIndex}
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
            No cards in this deck
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  light: { backgroundColor: '#f5f5f5' },
  dark: { backgroundColor: '#121212' },
  textLight: { color: '#000' },
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
    top: 20,
    right: 20,
    zIndex: 1,
  },
});

export default ViewDeckScreen;