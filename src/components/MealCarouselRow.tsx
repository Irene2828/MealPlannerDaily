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
  return '#CCFF00'; // Lime green for all as requested
};

const getMealMacrosObj = (title: string, id: string) => {
  const hash = (title + id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const protein = (hash % 15) + 12; // 12g - 26g
  const fats = (hash % 12) + 8;     // 8g - 19g
  const carbs = (hash % 30) + 20;    // 20g - 49g
  const calories = protein * 4 + fats * 9 + carbs * 4;
  return { protein, fats, carbs, calories };
};

const getMealMacrosString = (title: string, id: string) => {
  const { protein, fats, carbs, calories } = getMealMacrosObj(title, id);
  return `${protein} g protein, ${fats} g fats, ${carbs} g carbs, ${calories} cal`;
};

interface Props {
  day: string;
  slot: MealSlot;
  isKids: boolean;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export const MealCarouselRow: React.FC<Props> = ({
  day,
  slot,
  isKids,
  selectedIndex,
  onSelectIndex,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  // Card width fits exactly the same width as the text below it (screenWidth - 40)
  const CARD_WIDTH = screenWidth - CARD_HORIZONTAL_MARGIN * 2;

  const flatListRef = useRef<FlatList<MealOption>>(null);
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);
  const [ingredientsExpanded, setIngredientsExpanded] = useState(false);
  const [macrosExpanded, setMacrosExpanded] = useState(false);
  const [activeTrashMealId, setActiveTrashMealId] = useState<string | null>(null);
  const [pendingDeletions, setPendingDeletions] = useState<{ [mealId: string]: ReturnType<typeof setTimeout> }>({});
  const { 
    groceryList, 
    inventoryList, 
    confirmedMeals, 
    addToGrocery, 
    toggleInventory,
    toggleConfirmMeal,
    removeMealOption
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
        setMacrosExpanded(false);
      }
    },
    [selectedIndex, onSelectIndex, slot.options.length, CARD_WIDTH]
  );

  const toggleInstructions = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setInstructionsExpanded(!instructionsExpanded);
    if (!instructionsExpanded) {
      setIngredientsExpanded(false);
      setMacrosExpanded(false);
    }
  };

  const toggleIngredients = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIngredientsExpanded(!ingredientsExpanded);
    if (!ingredientsExpanded) {
      setInstructionsExpanded(false);
      setMacrosExpanded(false);
    }
  };

  const toggleMacros = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMacrosExpanded(!macrosExpanded);
    if (!macrosExpanded) {
      setInstructionsExpanded(false);
      setIngredientsExpanded(false);
    }
  };

  const renderCard = ({ item, index }: { item: MealOption; index: number }) => {
    const isTrashActive = activeTrashMealId === item.id;
    const isPendingDeletion = !!pendingDeletions[item.id];

    if (isPendingDeletion) {
      return (
        <View style={[styles.card, { width: CARD_WIDTH, marginRight: index === slot.options.length - 1 ? 0 : CARD_GAP }]}>
          <View style={{ flex: 1, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#FFF', fontFamily: 'DMSans_700Bold', marginBottom: 12, fontSize: 16 }}>Meal Removed</Text>
            <Pressable 
              style={{ backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}
              onPress={() => {
                clearTimeout(pendingDeletions[item.id]);
                setPendingDeletions(prev => {
                  const next = { ...prev };
                  delete next[item.id];
                  return next;
                });
              }}
            >
              <Text style={{ color: '#374151', fontFamily: 'DMSans_700Bold', fontSize: 14 }}>Undo</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    const mealId = `${day}_${slot.slotId}_${item.id}`;
    const isConfirmed = confirmedMeals.has(mealId);

    return (
      <View style={[styles.card, { width: CARD_WIDTH, marginRight: index === slot.options.length - 1 ? 0 : CARD_GAP }]}>
        <Image
          source={{ uri: item.imageUrl }}
          style={StyleSheet.absoluteFill as any}
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
          {isConfirmed && (
            <Ionicons name="checkmark" size={18} color="#1A1A1A" />
          )}
        </Pressable>

        {/* Subtle more button (3 dots) that turns into trash */}
        <Pressable 
          style={[styles.moreButton, isTrashActive && styles.moreButtonActive]}
          onPress={() => {
            if (isTrashActive) {
              const timeout = setTimeout(() => {
                removeMealOption(slot.slotId, item.id, isKids);
                setPendingDeletions(prev => {
                  const next = { ...prev };
                  delete next[item.id];
                  return next;
                });
              }, 4000);
              
              setPendingDeletions(prev => ({ ...prev, [item.id]: timeout }));
              setActiveTrashMealId(null);
            } else {
              setActiveTrashMealId(item.id);
            }
          }}
        >
          <Ionicons 
            name={isTrashActive ? "trash" : "ellipsis-horizontal"} 
            size={isTrashActive ? 14 : 16} 
            color="#FFFFFF" 
          />
        </Pressable>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{getMealMacrosString(item.title, item.id)}</Text>
        </View>
      </View>
    );
  };

  const neonColor = getNeonColor(slot.slotId);

  if (!slot.options || slot.options.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.carouselWrapper}>
          <View style={[styles.cardEmpty, { width: CARD_WIDTH }]}>
            <Text style={styles.emptyCardText}>No meals in this slot. Add some in Settings!</Text>
          </View>
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
      </View>
    );
  }

  const selected = slot.options[selectedIndex];

  const renderMacrosBreakdown = (item: MealOption) => {
    const macros = getMealMacrosObj(item.title, item.id);
    const maxVal = Math.max(macros.protein, macros.fats, macros.carbs);
    const getPercent = (val: number) => `${Math.round((val / maxVal) * 100)}%`;

    return (
      <View style={styles.macrosContainer}>
        <View style={styles.macroBarRow}>
          <View style={styles.macroInfo}>
            <Text style={styles.macroName}>Protein</Text>
            <Text style={styles.macroValue}>{macros.protein}g</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: getPercent(macros.protein) as any, backgroundColor: '#FF7A45' }]} />
          </View>
        </View>

        <View style={styles.macroBarRow}>
          <View style={styles.macroInfo}>
            <Text style={styles.macroName}>Fats</Text>
            <Text style={styles.macroValue}>{macros.fats}g</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: getPercent(macros.fats) as any, backgroundColor: '#CCFF00' }]} />
          </View>
        </View>

        <View style={styles.macroBarRow}>
          <View style={styles.macroInfo}>
            <Text style={styles.macroName}>Carbs</Text>
            <Text style={styles.macroValue}>{macros.carbs}g</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: getPercent(macros.carbs) as any, backgroundColor: '#00E5FF' }]} />
          </View>
        </View>

        <View style={styles.caloriesBanner}>
          <Text style={styles.caloriesText}>Total Energy: </Text>
          <Text style={styles.caloriesVal}>{macros.calories} kcal</Text>
        </View>
      </View>
    );
  };

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

      {/* Meal Info Header Row with Meal Name and action icons */}
      <View style={styles.mealHeaderRow}>
        <Text style={styles.mealHeaderName} numberOfLines={1}>{selected.title}</Text>
        <View style={styles.mealHeaderActions}>
          {/* Pan/Recipe Icon */}
          <Pressable 
            style={[styles.actionBtn, instructionsExpanded && styles.actionBtnActive]} 
            onPress={toggleInstructions}
          >
            <Ionicons 
              name={instructionsExpanded ? "restaurant" : "restaurant-outline"} 
              size={16} 
              color={instructionsExpanded ? "#FF7A45" : "#6B7280"} 
            />
          </Pressable>
          
          {/* List/Ingredients Icon */}
          <Pressable 
            style={[styles.actionBtn, ingredientsExpanded && styles.actionBtnActive]} 
            onPress={toggleIngredients}
          >
            <Ionicons 
              name={ingredientsExpanded ? "list" : "list-outline"} 
              size={16} 
              color={ingredientsExpanded ? "#FF7A45" : "#6B7280"} 
            />
          </Pressable>

          {/* Macros Icon */}
          <Pressable 
            style={[styles.actionBtn, macrosExpanded && styles.actionBtnActive]} 
            onPress={toggleMacros}
          >
            <Ionicons 
              name={macrosExpanded ? "pie-chart" : "pie-chart-outline"} 
              size={16} 
              color={macrosExpanded ? "#FF7A45" : "#6B7280"} 
            />
          </Pressable>
        </View>
      </View>

      {/* Expandable Sections Area */}
      <View style={styles.expandedArea}>
        {instructionsExpanded && (
          <View style={styles.expandedSection}>
            <Text style={styles.expandedSectionTitle}>How to cook</Text>
            <View style={styles.columnBody}>
              {selected.instructions.map((step, i) => (
                <Text key={i} style={styles.columnText}>{i + 1}. {step}</Text>
              ))}
            </View>
          </View>
        )}

        {ingredientsExpanded && (
          <View style={styles.expandedSection}>
            <Text style={styles.expandedSectionTitle}>Ingredients</Text>
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
          </View>
        )}

        {macrosExpanded && (
          <View style={styles.expandedSection}>
            <Text style={styles.expandedSectionTitle}>Nutrition Breakdown</Text>
            <View style={styles.columnBody}>
              {renderMacrosBreakdown(selected)}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmCheckboxActive: {
    backgroundColor: '#FFFFFF',
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
    fontSize: 12,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    lineHeight: 16,
  },
  mealHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: CARD_HORIZONTAL_MARGIN,
    marginTop: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#FDE6D4',
    marginBottom: 12,
  },
  mealHeaderName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#4B5563',
    flex: 1,
    marginRight: 12,
  },
  mealHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnActive: {
    backgroundColor: '#FDE6D4',
    borderColor: '#FF7A45',
  },
  expandedArea: {
    marginHorizontal: CARD_HORIZONTAL_MARGIN,
    marginTop: 4,
  },
  expandedSection: {
    marginBottom: 16,
  },
  expandedSectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#9CA3AF',
    marginBottom: 8,
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
    opacity: 0.8,
  },
  macrosContainer: {
    paddingTop: 4,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  macroBarRow: {
    marginBottom: 10,
  },
  macroInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  macroName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: '#4B5563',
    opacity: 0.8,
  },
  macroValue: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#1F2937',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  caloriesBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  caloriesText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: '#4B5563',
    opacity: 0.8,
  },
  caloriesVal: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: '#FF7A45',
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
    opacity: 0.8,
  },
  ingredientTextChecked: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
    opacity: 0.6,
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
  moreButton: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  moreButtonActive: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  cardEmpty: {
    height: 154,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  emptyCardText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: '#6B7280',
  },
});
