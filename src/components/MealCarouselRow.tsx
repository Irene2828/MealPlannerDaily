import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
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
  const [openSection, setOpenSection] = useState<'shopping' | 'instructions' | null>(null);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
      const clamped = Math.max(0, Math.min(index, slot.options.length - 1));
      if (clamped !== selectedIndex) {
        onSelectIndex(clamped);
        setOpenSection(null); // Close accordions when swiping
      }
    },
    [selectedIndex, onSelectIndex, slot.options.length]
  );

  const toggleSection = (section: 'shopping' | 'instructions') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSection(openSection === section ? null : section);
  };

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

      {/* Accordions for selected item */}
      <View style={styles.accordionContainer}>
        {/* Shopping List */}
        <Pressable style={styles.accordionHeader} onPress={() => toggleSection('shopping')}>
          <Text style={styles.accordionTitle}>Shopping List</Text>
          <Text style={styles.accordionIcon}>{openSection === 'shopping' ? 'ᐱ' : 'ᐯ'}</Text>
        </Pressable>
        {openSection === 'shopping' && (
          <View style={styles.accordionBody}>
            {selected.shoppingList.map((item, i) => (
              <Text key={i} style={styles.accordionText}>• {item}</Text>
            ))}
          </View>
        )}

        {/* Instructions */}
        <Pressable style={[styles.accordionHeader, { borderBottomWidth: 0 }]} onPress={() => toggleSection('instructions')}>
          <Text style={styles.accordionTitle}>Instructions</Text>
          <Text style={styles.accordionIcon}>{openSection === 'instructions' ? 'ᐱ' : 'ᐯ'}</Text>
        </Pressable>
        {openSection === 'instructions' && (
          <View style={styles.accordionBody}>
            {selected.instructions.map((step, i) => (
              <Text key={i} style={styles.accordionText}>{i + 1}. {step}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  flatListContent: {
    paddingHorizontal: CARD_HORIZONTAL_MARGIN,
    paddingBottom: 8,
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
  accordionContainer: {
    marginHorizontal: CARD_HORIZONTAL_MARGIN,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FDE6D4', // light orange border
    marginTop: 4,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#FDE6D4',
  },
  accordionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#1A1A1A',
  },
  accordionIcon: {
    fontSize: 14,
    color: '#EA580C',
    fontWeight: 'bold',
  },
  accordionBody: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  accordionText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 6,
  },
});

