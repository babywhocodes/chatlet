import React, { Component } from 'react';
import {
  PanResponder,
  Text,
  View,
  Dimensions,
  Animated,
  InteractionManager,
  StyleSheet
} from 'react-native';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

const LABEL_TYPES = {
  NONE: 'none',
  LEFT: 'left',
  RIGHT: 'right'
};

const SWIPE_MULTIPLY_FACTOR = 7;

class Swiper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstCardIndex: props.cardIndex || 0,
      secondCardIndex: props.cardIndex === props.cards.length - 1 ? 0 : props.cardIndex + 1,
      previousCardIndex: props.cardIndex === 0 ? props.cards.length - 1 : props.cardIndex - 1,
      pan: new Animated.ValueXY(),
      previousCardX: new Animated.Value(-width),
      previousCardY: new Animated.Value(-height),
      panResponderLocked: false,
      labelType: LABEL_TYPES.NONE,
      slideGesture: false
    };

    this._mounted = true;
    this._animatedValueX = 0;
    this._animatedValueY = 0;

    this.state.pan.x.addListener(value => (this._animatedValueX = value.value));
    this.state.pan.y.addListener(value => (this._animatedValueY = value.value));

    this.initializePanResponder();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { props, state } = this;
    const propsChanged = (
      !isEqual(props.cards, nextProps.cards) ||
      props.cardIndex !== nextProps.cardIndex
    );
    const stateChanged = (
      nextState.firstCardIndex !== state.firstCardIndex ||
      nextState.secondCardIndex !== state.secondCardIndex ||
      nextState.previousCardIndex !== state.previousCardIndex ||
      nextState.labelType !== state.labelType
    );
    return propsChanged || stateChanged;
  }

  componentWillUnmount() {
    this._mounted = false;
    InteractionManager.runAfterInteractions(() => {
      this.state.pan.x.removeAllListeners();
      this.state.pan.y.removeAllListeners();
    });
  }

  initializePanResponder = () => {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: this.onPanResponderGrant,
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderRelease,
      onPanResponderTerminate: this.onPanResponderRelease
    });
  };

  onPanResponderMove = (event, gestureState) => {
    this.props.onSwiping(this._animatedValueX, this._animatedValueY);

    const overlayOpacityThreshold = this.props.horizontalThreshold;

    let isSwipingLeft, isSwipingRight;

    if (Math.abs(this._animatedValueX) > overlayOpacityThreshold) {
      if (this._animatedValueX > 0) isSwipingRight = true;
      else isSwipingLeft = true;
    }

    if (isSwipingRight) {
      this.setState({ labelType: LABEL_TYPES.RIGHT });
    } else if (isSwipingLeft) {
      this.setState({ labelType: LABEL_TYPES.LEFT });
    } else {
      this.setState({ labelType: LABEL_TYPES.NONE });
    }

    const { onTapCardDeadZone } = this.props;
    if (
      this._animatedValueX < -onTapCardDeadZone ||
      this._animatedValueX > onTapCardDeadZone
    ) {
      this.setState({ slideGesture: true });
    }

    Animated.event([null, { dx: this.state.pan.x }], { useNativeDriver: false })(
      event,
      gestureState
    );
  };

  onPanResponderGrant = () => {
    this.props.dragStart && this.props.dragStart();
    if (!this.state.panResponderLocked) {
      this.state.pan.setOffset({ x: 0, y: 0 });
    }
    this.state.pan.setValue({ x: 0, y: 0 });
  };

  onPanResponderRelease = (e, gestureState) => {
    this.props.dragEnd && this.props.dragEnd();
    if (this.state.panResponderLocked) {
      this.state.pan.setValue({ x: 0, y: 0 });
      this.state.pan.setOffset({ x: 0, y: 0 });
      return;
    }

    const { horizontalThreshold } = this.props;
    const animatedValueX = Math.abs(this._animatedValueX);
    const isSwiping = animatedValueX > horizontalThreshold;

    if (isSwiping && this.validPanResponderRelease()) {
      const onSwipeDirectionCallback = this.getOnSwipeDirectionCallback(this._animatedValueX);
      this.swipeCard(onSwipeDirectionCallback);
    } else {
      this.resetTopCard();
    }

    if (!this.state.slideGesture) {
      this.props.onTapCard(this.state.firstCardIndex);
    }

    this.setState({
      labelType: LABEL_TYPES.NONE,
      slideGesture: false
    });
  };

  validPanResponderRelease = () => {
    const { disableLeftSwipe, disableRightSwipe } = this.props;
    const { isSwipingLeft, isSwipingRight } = this.getSwipeDirection(this._animatedValueX);
    return (isSwipingLeft && !disableLeftSwipe) || (isSwipingRight && !disableRightSwipe);
  };

  getOnSwipeDirectionCallback = (animatedValueX) => {
    const { onSwipedLeft, onSwipedRight } = this.props;
    const { isSwipingLeft, isSwipingRight } = this.getSwipeDirection(animatedValueX);

    if (isSwipingRight) return onSwipedRight;
    if (isSwipingLeft) return onSwipedLeft;
  };

  getSwipeDirection = (animatedValueX) => {
    const isSwipingLeft = animatedValueX < -this.props.horizontalThreshold;
    const isSwipingRight = animatedValueX > this.props.horizontalThreshold;
    return { isSwipingLeft, isSwipingRight };
  };

  resetTopCard = (cb) => {
    Animated.spring(this.state.pan, {
      toValue: 0,
      friction: this.props.topCardResetAnimationFriction,
      tension: this.props.topCardResetAnimationTension,
      useNativeDriver: true
    }).start(cb);

    this.state.pan.setOffset({ x: 0, y: 0 });
    this.props.onSwipedAborted();
  };

  swipeLeft = () => {
    this.swipeCard(this.props.onSwipedLeft, -this.props.horizontalThreshold, 0);
  };

  swipeRight = () => {
    this.swipeCard(this.props.onSwipedRight, this.props.horizontalThreshold, 0);
  };

  swipeCard = (onSwiped, x = this._animatedValueX, y = 0) => {
    this.setState({ panResponderLocked: true });
    
    Animated.timing(this.state.pan, {
      toValue: { x: x * SWIPE_MULTIPLY_FACTOR, y: y * SWIPE_MULTIPLY_FACTOR },
      duration: this.props.swipeAnimationDuration,
      useNativeDriver: true
    }).start(() => {
      this.incrementCardIndex(onSwiped);
    });
  };

  incrementCardIndex = (onSwiped) => {
    const { firstCardIndex } = this.state;
    let newCardIndex = firstCardIndex + 1;
    let swipedAllCards = false;

    this.onSwipedCallbacks(onSwiped);

    if (newCardIndex === this.props.cards.length) {
      this.props.onSwipedAll();
      if (newCardIndex === this.props.cards.length) {
        swipedAllCards = true;
      } else {
        newCardIndex = 0;
      }
    }

    this.setCardIndex(newCardIndex, swipedAllCards);
  };

  onSwipedCallbacks = (swipeDirectionCallback) => {
    const previousCardIndex = this.state.firstCardIndex;
    this.props.onSwiped(previousCardIndex, this.props.cards[previousCardIndex]);
    if (swipeDirectionCallback) {
      swipeDirectionCallback(previousCardIndex, this.props.cards[previousCardIndex]);
    }
  };

  setCardIndex = (newCardIndex, swipedAllCards) => {
    if (this._mounted) {
      const cards = this.props.cards;
      this.setState(
        {
          firstCardIndex: newCardIndex,
          secondCardIndex: newCardIndex === cards.length - 1 ? 0 : newCardIndex + 1,
          previousCardIndex: newCardIndex === 0 ? cards.length - 1 : newCardIndex - 1,
          swipedAllCards: swipedAllCards,
          panResponderLocked: false
        },
        this.resetPanAndScale
      );
    }
  };

  resetPanAndScale = () => {
    this.state.pan.setValue({ x: 0, y: 0 });
    this.state.pan.setOffset({ x: 0, y: 0 });
    this._animatedValueX = 0;
    this._animatedValueY = 0;
    this.state.previousCardX.setValue(-width);
    this.state.previousCardY.setValue(-height);
  };

  calculateOverlayLabelStyle = () => {
    const dynamicStyle = this.props.overlayLabels[this.state.labelType]?.style;
    let overlayLabelStyle = dynamicStyle ? dynamicStyle.label : {};
    
    if (this.state.labelType === LABEL_TYPES.NONE) {
      overlayLabelStyle = styles.hideOverlayLabel;
    }

    return [this.props.overlayLabelStyle, overlayLabelStyle];
  };

  calculateOverlayLabelWrapperStyle = () => {
    const dynamicStyle = this.props.overlayLabels[this.state.labelType]?.style;
    const dynamicWrapperStyle = dynamicStyle ? dynamicStyle.wrapper : {};
    
    const opacity = this.props.animateOverlayLabelsOpacity
      ? this.interpolateOverlayLabelsOpacity()
      : 1;
      
    return [this.props.overlayLabelWrapperStyle, dynamicWrapperStyle, { opacity }];
  };

  calculateSwipableCardStyle = () => {
    const opacity = this.props.animateCardOpacity
      ? this.interpolateCardOpacity()
      : 1;
    const rotation = this.interpolateRotation();

    return [
      styles.card,
      {
        width: width * 0.95,
        height: 500,
        alignSelf: 'center',
        zIndex: 1,
        opacity: opacity,
        transform: [
          { translateX: this.state.pan.x },
          { translateY: this.state.pan.y },
          { rotate: rotation }
        ]
      },
      this.props.cardStyle
    ];
  };

  interpolateCardOpacity = () => {
    return this.state.pan.x.interpolate({
      inputRange: this.props.inputCardOpacityRangeX,
      outputRange: this.props.outputCardOpacityRangeX
    });
  };

  interpolateOverlayLabelsOpacity = () => {
    return this.state.pan.x.interpolate({
      inputRange: this.props.inputOverlayLabelsOpacityRangeX,
      outputRange: this.props.outputOverlayLabelsOpacityRangeX
    });
  };

  interpolateRotation = () => {
    return this.state.pan.x.interpolate({
      inputRange: this.props.inputRotationRange,
      outputRange: this.props.outputRotationRange
    });
  };

  render() {
    const { pointerEvents, backgroundColor, containerStyle } = this.props;
    return (
      <View
        pointerEvents={pointerEvents}
        style={[
          styles.container,
          { backgroundColor: backgroundColor },
          containerStyle
        ]}
      >
        {this.renderChildren()}
        {this.renderStack()}
      </View>
    );
  }

  renderChildren = () => {
    return (
      <View pointerEvents='box-none' style={styles.childrenViewStyle}>
        {this.props.children}
      </View>
    );
  };

  renderStack = () => {
    const { firstCardIndex, swipedAllCards } = this.state;
    const { cards, renderCard } = this.props;
    const renderedCards = [];
    
    // Only render the top card (simplified for your use case)
    if (cards.length > 0 && !swipedAllCards) {
      const key = this.props.keyExtractor 
        ? this.props.keyExtractor(cards[firstCardIndex]) 
        : firstCardIndex;
        
      const swipableCardStyle = this.calculateSwipableCardStyle();
      const stackCard = renderCard(cards[firstCardIndex]);
      const renderOverlayLabel = this.renderOverlayLabel();

      renderedCards.push(
        <Animated.View
          key={key}
          style={swipableCardStyle}
          {...this._panResponder.panHandlers}
        >
          {renderOverlayLabel}
          {stackCard}
        </Animated.View>
      );
    }

    return renderedCards;
  };

  renderOverlayLabel = () => {
    const { disableLeftSwipe, disableRightSwipe, overlayLabels } = this.props;
    const { labelType } = this.state;

    const labelTypeNone = labelType === LABEL_TYPES.NONE;
    const directionSwipeLabelDisabled =
      (labelType === LABEL_TYPES.LEFT && disableLeftSwipe) ||
      (labelType === LABEL_TYPES.RIGHT && disableRightSwipe);

    if (
      !overlayLabels ||
      !overlayLabels[labelType] ||
      labelTypeNone ||
      directionSwipeLabelDisabled
    ) {
      return null;
    }

    return (
      <Animated.View style={this.calculateOverlayLabelWrapperStyle()}>
        {overlayLabels[labelType].element}
      </Animated.View>
    );
  };
}

Swiper.propTypes = {
  animateCardOpacity: PropTypes.bool,
  animateOverlayLabelsOpacity: PropTypes.bool,
  backgroundColor: PropTypes.string,
  cardIndex: PropTypes.number,
  cardStyle: PropTypes.object,
  cards: PropTypes.array.isRequired,
  children: PropTypes.any,
  containerStyle: PropTypes.object,
  disableLeftSwipe: PropTypes.bool,
  disableRightSwipe: PropTypes.bool,
  dragEnd: PropTypes.func,
  dragStart: PropTypes.func,
  horizontalThreshold: PropTypes.number,
  inputCardOpacityRangeX: PropTypes.array,
  inputOverlayLabelsOpacityRangeX: PropTypes.array,
  inputRotationRange: PropTypes.array,
  keyExtractor: PropTypes.func,
  onSwiped: PropTypes.func,
  onSwipedAborted: PropTypes.func,
  onSwipedAll: PropTypes.func,
  onSwipedLeft: PropTypes.func,
  onSwipedRight: PropTypes.func,
  onSwiping: PropTypes.func,
  onTapCard: PropTypes.func,
  onTapCardDeadZone: PropTypes.number,
  outputCardOpacityRangeX: PropTypes.array,
  outputOverlayLabelsOpacityRangeX: PropTypes.array,
  outputRotationRange: PropTypes.array,
  overlayLabels: PropTypes.object,
  overlayLabelStyle: PropTypes.object,
  overlayLabelWrapperStyle: PropTypes.object,
  pointerEvents: PropTypes.string,
  renderCard: PropTypes.func.isRequired,
  swipeAnimationDuration: PropTypes.number,
  topCardResetAnimationFriction: PropTypes.number,
  topCardResetAnimationTension: PropTypes.number,
};
Swiper.defaultProps = {
  animateCardOpacity: false,
  animateOverlayLabelsOpacity: false,
  backgroundColor: 'transparent',
  cardIndex: 0,
  cardStyle: {},
  disableLeftSwipe: false,
  disableRightSwipe: false,
  horizontalThreshold: width / 4,
  inputCardOpacityRangeX: [-width / 2, -width / 3, 0, width / 3, width / 2],
  inputOverlayLabelsOpacityRangeX: [-width / 3, -width / 4, 0, width / 4, width / 3],
  inputRotationRange: [-width / 2, 0, width / 2],
  onSwiped: () => {},
  onSwipedAborted: () => {},
  onSwipedAll: () => {},
  onSwipedLeft: () => {},
  onSwipedRight: () => {},
  onSwiping: () => {},
  onTapCard: () => {},
  onTapCardDeadZone: 5,
  outputCardOpacityRangeX: [0.8, 1, 1, 1, 0.8],
  outputOverlayLabelsOpacityRangeX: [1, 0, 0, 0, 1],
  outputRotationRange: ['-10deg', '0deg', '10deg'],
  overlayLabelStyle: {
    fontSize: 45,
    fontWeight: 'bold',
    borderRadius: 10,
    padding: 10,
    overflow: 'hidden'
  },
  overlayLabelWrapperStyle: {
    position: 'absolute',
    backgroundColor: 'transparent',
    zIndex: 2,
    flex: 1,
    width: '100%',
    height: '100%'
  },
  pointerEvents: 'auto',
  swipeAnimationDuration: 350,
  topCardResetAnimationFriction: 7,
  topCardResetAnimationTension: 40
};

const styles = StyleSheet.create({

  card: {

    flex: 1,

    position: 'absolute'

  },

  container: {

    alignItems: 'stretch',

    position: 'absolute',

    top: 0,

    left: 0,

    right: 0,

    bottom: 0

  },

  childrenViewStyle: {

    position: 'absolute',

    top: 0,

    left: 0,

    right: 0,

    bottom: 0

  },

  overlayLabelWrapper: {

    position: 'absolute',

    backgroundColor: 'transparent',

    zIndex: 2,

    flex: 1,

    width: '100%',

    height: '100%'

  },

  hideOverlayLabel: {

    opacity: 0

  },

  overlayLabel: {

    fontSize: 45,

    fontWeight: 'bold',

    borderRadius: 10,

    padding: 10,

    overflow: 'hidden'

  },

  bottomOverlayLabelWrapper: {

    flexDirection: 'column',

    alignItems: 'center',

    justifyContent: 'center'

  },

  topOverlayLabelWrapper: {

    flexDirection: 'column',

    alignItems: 'center',

    justifyContent: 'center'

  },

  rightOverlayLabelWrapper: {

    flexDirection: 'column',

    alignItems: 'flex-start',

    justifyContent: 'flex-start',

    marginTop: 30,

    marginLeft: 30

  },

  leftOverlayLabelWrapper: {

    flexDirection: 'column',

    alignItems: 'flex-end',

    justifyContent: 'flex-start',

    marginTop: 30,

    marginLeft: -30

  }

})

export default Swiper;