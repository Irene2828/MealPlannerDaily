import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutAnimation,
  Platform,
  UIManager,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MealOption, MealSlot } from '../data/meals';
import { useGrocery } from '../context/GroceryContext';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const CARD_HORIZONTAL_MARGIN = 20;
const CARD_GAP = 12;

const getNeonColor = (slotId: string) => {
  switch (slotId) {
    case 'breakfast': return '#FFE600'; // Neon Yellow
    case 'morning-snack': return '#CCFF00'; // Neon Yellow-Green
    case 'lunch': return '#00E5FF'; // Teal Blue
    case 'afternoon-snack': return '#FFB04C'; // Light Orange
    case 'dinner': return '#D494FF'; // Light Purple
    default: return '#CCFF00';
  }
};

interface Props {
  day: string;
  slot: MealSlot;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export const MealCarouselRow: React.FC<Props> = ({
  day,
  slot,
  selectedIndex,
  onSelectIndex,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  // 85% of screen width leaves room to hint that there are more cards to scroll
  const CARD_WIDTH = screenWidth * 0.85;

  const flatListRef = useRef<FlatList<MealOption>>(null);
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);
  const [ingredientsExpanded, setIngredientsExpanded] = useState(false);
  const { 
    groceryList, 
    inventoryList, 
    confirmedMeals, 
    addToGrocery, 
    toggleInventory,
    toggleConfirmMeal 
  } = useGrocery();

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
    [selectedIndex, onSelectIndex, slot.options.length, CARD_WIDTH]
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
    const mealId = `${day}_${slot.slotId}_${item.id}`;
    const isConfirmed = confirmedMeals.has(mealId);

    return (
      <View style={[styles.card, { width: CARD_WIDTH, marginRight: index === slot.options.length - 1 ? 0 : CARD_GAP }]}>
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

        {/* Confirmation Checkbox Overlay */}
        <Pressable 
          style={[styles.confirmCheckbox, isConfirmed && styles.confirmCheckboxActive]}
          onPress={() => toggleConfirmMeal(mealId)}
        >
          {isConfirmed ? (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          ) : (
            <View style={styles.confirmCheckboxInner} />
          )}
        </Pressable>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
      </View>
    );
  };

  const selected = slot.options[selectedIndex];
  const neonColor = getNeonColor(slot.slotId);

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
        <View 
          style={[
            styles.neonTag, 
            { backgroundColor: neonColor, shadowColor: neonColor }
          ]} 
          pointerEvents="none"
        >
          <Text style={styles.neonTagText}>{slot.slotLabel}</Text>
        </View>
      </View>

      {/* 2-Column Expandable Area */}
      <View style={styles.contentContainer}>
        {/* Column 1: Instructions */}
        <View style={styles.column}>
          <Pressable style={styles.columnHeader} onPress={toggleInstructions}>
            <Text style={styles.columnTitle}>How to cook</Text>
            <Ionicons 
              name={instructionsExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#9CA3AF" 
            />
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
            <Ionicons 
              name={ingredientsExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#9CA3AF" 
            />
          </Pressable>
          {ingredientsExpanded && (
            <View style={styles.columnBody}>
              {selected.shoppingList.map((item, i) => {
                const isHave = inventoryList.has(item);
                const isAddedToGrocery = groceryList.has(item);

                return (
                  <View key={i} style={styles.ingredientItemContainer}>
                    <View style={styles.ingredientRowMain}>
                      <Pressable 
                        style={styles.circleButton}
                        onPress={() => toggleInventory(item)}
                      >
                        <Ionicons 
                          name={isHave ? "checkmark-circle-outline" : "ellipse-outline"} 
                          size={20} 
                          color={isHave ? "#10B981" : "#D1D5DB"} 
                        />
                      </Pressable>

                      <Text 
                        style={[
                          styles.ingredientText, 
                          isHave && styles.ingredientTextChecked
                        ]}
                      >
                        {item}
                      </Text>
                    </View>

                    {!isHave && (
                      <View style={styles.ingredientActionRow}>
                        <Pressable 
                          style={[styles.needToBuyPill, isAddedToGrocery && styles.addedPill]}
                          onPress={() => addToGrocery(item)}
                        >
                          <Text style={[styles.needToBuyText, isAddedToGrocery && styles.addedText]}>
                            {isAddedToGrocery ? 'ADDED' : 'TO BUY'}
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
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
  carouselWrapper: {
    position: 'relative',
  },
  flatListContent: {
    paddingHorizontal: CARD_HORIZONTAL_MARGIN,
    paddingBottom: 4,
  },
  card: {
    height: 154,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  confirmCheckbox: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  confirmCheckboxActive: {
    backgroundColor: '#10B981',
  },
  confirmCheckboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    transform: [{ rotate: '-2deg' }],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
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
    marginTop: 4,
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
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#4B5563',
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
  ingredientItemContainer: {
    marginBottom: 12,
  },
  ingredientRowMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingRight: 4,
  },
  ingredientActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  circleButton: {
    padding: 2,
    marginTop: -2, // to align with text visually
  },
  ingredientText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#1A1A1A',
    lineHeight: 18,
    flex: 1,
  },
  ingredientTextChecked: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  needToBuyPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  addedPill: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  needToBuyText: {
    color: '#1A1A1A',
    fontSize: 9,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addedText: {
    color: '#6B7280',
  },
});
