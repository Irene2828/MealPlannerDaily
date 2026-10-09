import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  useWindowDimensions,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealOption, MealSlot } from '../data/meals';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const CARD_HORIZONTAL_MARGIN = 16;
const CARD_GAP = 20;

interface Props {
  day: string;
  slot: MealSlot;
  isKids: boolean;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export const MealCarouselRow: React.FC<Props> = ({
  slot,
  selectedIndex,
  onSelectIndex,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  // We make it take most of the screen width
  const CARD_WIDTH = Math.min((screenWidth - 64) * 1.1, screenWidth - 32);
  const CARD_HEIGHT = Math.min(CARD_WIDTH * 0.625, 240); // 16:10 aspect ratio approx

  const flatListRef = useRef<FlatList<MealOption>>(null);

  // Scroll to selected if it changes
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < slot.options.length) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: selectedIndex, animated: true, viewPosition: 0.5 });
      }, 100);
    }
  }, [selectedIndex, slot.options.length]);

  const renderItem = ({ item, index }: { item: MealOption; index: number }) => {
    const isSelected = index === selectedIndex;

    return (
      <Pressable
        onPress={() => onSelectIndex(index)}
        style={[
          styles.cardContainer,
          { width: CARD_WIDTH },
          isSelected && styles.cardContainerSelected
        ]}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={[
            styles.cardImage,
            { height: CARD_HEIGHT }
          ]}
          resizeMode="cover"
        />
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            </View>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.mealName} numberOfLines={2}>{item.title}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.slotHeader}>
        <Text style={styles.slotTitle}>
          <Text style={styles.slotEmoji}>{slot.slotEmoji}</Text> {slot.slotLabel}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={slot.options}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: (screenWidth - CARD_WIDTH) / 2,
          gap: CARD_GAP,
          paddingVertical: 10,
        }}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  slotHeader: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  slotEmoji: {
    fontSize: 20,
  },
  slotTitle: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 22,
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContainerSelected: {
    borderColor: '#10B981', // green border for selected
  },
  cardImage: {
    width: '100%',
    backgroundColor: '#F3F4F6',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 185, 129, 0.15)', // Light green tint
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  checkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  textContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
  mealName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
    textAlign: 'center',
  },
});
