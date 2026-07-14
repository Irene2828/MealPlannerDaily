import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { MealOption, MealSlot } from '../data/meals';

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

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
      const clamped = Math.max(0, Math.min(index, slot.options.length - 1));
      if (clamped !== selectedIndex) {
        onSelectIndex(clamped);
      }
    },
    [selectedIndex, onSelectIndex, slot.options.length]
  );

  const renderCard = ({ item, index }: { item: MealOption; index: number }) => {
    return (
      <View style={[styles.card, { marginRight: index === slot.options.length - 1 ? 0 : CARD_GAP }]}>
        <Image
          source={{ uri: item.imageUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        {/* Dark overlay to make text pop */}
        <View style={styles.overlay} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
            {slot.slotLabel} – {item.title}
          </Text>
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

      {/* 2-Column Content Area */}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cardContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'Fraunces_900Black',
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  contentContainer: {
    flexDirection: 'row',
    marginHorizontal: CARD_HORIZONTAL_MARGIN,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
  },
  columnTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
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

