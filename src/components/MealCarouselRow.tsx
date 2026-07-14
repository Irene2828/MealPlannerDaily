import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MealOption, MealSlot } from '../data/meals';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_MARGIN = 20;
const CARD_GAP = 12;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_MARGIN * 2;

interface Props {
  slot: MealSlot;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export const MealCarouselRow: React.FC<Props> = ({
  slot,
  selectedIndex,
  onSelectIndex,
}) => {
  const flatListRef = useRef<FlatList<MealOption>>(null);
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);
  const [ingredientsExpanded, setIngredientsExpanded] = useState(false);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
      const clamped = Math.max(0, Math.min(index, slot.options.length - 1));
      if (clamped !== selectedIndex) {
        onSelectIndex(clamped);
        setInstructionsExpanded(false);
        setIngredientsExpanded(false);
      }
    },
    [selectedIndex, onSelectIndex, slot.options.length]
  );

  const toggleInstructions = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setInstructionsExpanded(!instructionsExpanded);
  };

  const toggleIngredients = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIngredientsExpanded(!ingredientsExpanded);
  };

  const renderCard = ({ item, index }: { item: MealOption; index: number }) => {
    return (
      <View style={[styles.card, { marginRight: index === slot.options.length - 1 ? 0 : CARD_GAP }]}>
        <Image
          source={{ uri: item.imageUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        {/* Subtle gradient overlay at bottom for text legibility */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.gradientOverlay}
        />

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
      </View>
    );
  };

  const selected = slot.options[selectedIndex];

  return (
    <View style={styles.container}>
      {/* Carousel Area */}
      <View style={styles.carouselWrapper}>
        <FlatList
          ref={flatListRef}
          data={slot.options}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_GAP}
          decelerationRate="fast"
          contentContainerStyle={styles.flatListContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
        
        {/* Sticky Neon Office Tag */}
        <View style={styles.neonTag} pointerEvents="none">
          <Text style={styles.neonTagText}>{slot.slotLabel}</Text>
        </View>
      </View>

      {/* 2-Column Expandable Area */}
      <View style={styles.contentContainer}>
        {/* Column 1: Instructions */}
        <View style={styles.column}>
          <Pressable style={styles.columnHeader} onPress={toggleInstructions}>
            <Text style={styles.columnTitle}>How to cook</Text>
            <Text style={styles.columnIcon}>{instructionsExpanded ? 'ᐱ' : 'ᐯ'}</Text>
          </Pressable>
          {instructionsExpanded && (
            <View style={styles.columnBody}>
              {selected.instructions.map((step, i) => (
                <Text key={i} style={styles.columnText}>{i + 1}. {step}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Column 2: Ingredients */}
        <View style={styles.column}>
          <Pressable style={styles.columnHeader} onPress={toggleIngredients}>
            <Text style={styles.columnTitle}>Ingredients</Text>
            <Text style={styles.columnIcon}>{ingredientsExpanded ? 'ᐱ' : 'ᐯ'}</Text>
          </Pressable>
          {ingredientsExpanded && (
            <View style={styles.columnBody}>
              {selected.shoppingList.map((item, i) => (
                <Text key={i} style={styles.columnText}>• {item}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  flatListContent: {
    paddingHorizontal: CARD_HORIZONTAL_MARGIN,
    paddingBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end', // Aligns content to bottom
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%', // Gradient only covers the bottom half
  },
  neonTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#CCFF00', // Neon Yellow-Green
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    transform: [{ rotate: '-2deg' }],
    shadowColor: '#CCFF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  neonTagText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    width: '100%',
  },
  cardTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  contentContainer: {
    flexDirection: 'row',
    marginHorizontal: CARD_HORIZONTAL_MARGIN,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16, // Adds space between the two columns
  },
  column: {
    flex: 1,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#FDE6D4', // light orange border
    marginBottom: 8,
  },
  columnTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  columnIcon: {
    fontSize: 12,
    color: '#EA580C',
    fontWeight: 'bold',
  },
  columnBody: {
    paddingTop: 4,
  },
  columnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 6,
  },
});



