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
  const [expanded, setExpanded] = useState(false);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
      const clamped = Math.max(0, Math.min(index, slot.options.length - 1));
      if (clamped !== selectedIndex) {
        onSelectIndex(clamped);
        setExpanded(false); // Collapse when swiping to a new meal
      }
    },
    [selectedIndex, onSelectIndex, slot.options.length]
  );

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
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
          <Text style={styles.cardEyebrow}>{slot.slotLabel}</Text>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
      </View>
    );
  };

  const selected = slot.options[selectedIndex];

  return (
    <View style={styles.container}>
      {/* Carousel */}
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

      {/* Collapsible Recipe Details Area */}
      <View style={styles.recipeDetailsWrapper}>
        <Pressable style={styles.recipeDetailsHeader} onPress={toggleExpanded}>
          <Text style={styles.recipeDetailsHeaderTitle}>View Recipe Details</Text>
          <Text style={styles.recipeDetailsHeaderIcon}>{expanded ? 'ᐱ' : 'ᐯ'}</Text>
        </Pressable>

        {expanded && (
          <View style={styles.contentContainer}>
            {/* Column 1: Instructions */}
            <View style={styles.column}>
              <Text style={styles.columnTitle}>Instructions</Text>
              {selected.instructions.map((step, i) => (
                <Text key={i} style={styles.columnText}>{i + 1}. {step}</Text>
              ))}
            </View>

            {/* Column 2: Ingredients */}
            <View style={styles.column}>
              <Text style={styles.columnTitle}>Ingredients</Text>
              {selected.shoppingList.map((item, i) => (
                <Text key={i} style={styles.columnText}>• {item}</Text>
              ))}
            </View>
          </View>
        )}
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
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    width: '100%',
  },
  cardEyebrow: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  recipeDetailsWrapper: {
    marginHorizontal: CARD_HORIZONTAL_MARGIN,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FDE6D4', // light orange border
  },
  recipeDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  recipeDetailsHeaderTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#1A1A1A',
  },
  recipeDetailsHeaderIcon: {
    fontSize: 14,
    color: '#EA580C',
    fontWeight: 'bold',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 4,
    paddingBottom: 16,
  },
  column: {
    flex: 1,
  },
  columnTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#1A1A1A',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  columnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 6,
    paddingRight: 12,
  },
});


