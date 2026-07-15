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
  ActivityIndicator,
  TextInput,
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

export const getMealMacrosObj = (title: string, id: string) => {
  const hash = (title + id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const protein = (hash % 15) + 12; // 12g - 26g
  const fats = (hash % 12) + 8;     // 8g - 19g
  const carbs = (hash % 30) + 20;    // 20g - 49g
  const calories = protein * 4 + fats * 9 + carbs * 4;
  return { protein, fats, carbs, calories };
};

const getMealMacrosString = (title: string, id: string) => {
  const { protein, fats, carbs, calories } = getMealMacrosObj(title, id);
  return `${protein}g P   •   ${fats}g F   •   ${carbs}g C   •   ${calories} Cal`;
};

const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&auto=format&fit=crop',
];

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
  const [activeMenuMealId, setActiveMenuMealId] = useState<string | null>(null);
  const [generatingImageMealId, setGeneratingImageMealId] = useState<string | null>(null);
  const [pendingDeletions, setPendingDeletions] = useState<{ [mealId: string]: ReturnType<typeof setTimeout> }>({});
  
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [isEditingIngredients, setIsEditingIngredients] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<'instructions' | 'ingredients' | null>(null);
  
  const [draftInstructions, setDraftInstructions] = useState<string[]>([]);
  const [draftIngredients, setDraftIngredients] = useState<string[]>([]);

  const { 
    groceryList, 
    inventoryList, 
    confirmedMeals, 
    addToGrocery, 
    toggleInventory,
    toggleConfirmMeal,
    removeMealOption,
    updateMealImage,
    updateMealInstructions,
    updateMealIngredients
  } = useGrocery();

  const MOCK_AI_INSTRUCTIONS = [
    ["Blend with high-speed blender until silky smooth", "Pour into a chilled glass bowl", "Garnish with fresh organic mint leaves and chia seeds", "Serve immediately with a bamboo spoon"],
    ["Preheat pan to medium heat", "Sauté lightly with premium extra virgin olive oil", "Season with Himalayan pink salt and cracked black pepper", "Plate beautifully and enjoy fresh"],
    ["Layer ingredients evenly in a glass jar", "Drizzle with organic clover honey", "Chill in refrigerator for 30 minutes to set", "Top with toasted almonds and serve cold"]
  ];

  const MOCK_AI_INGREDIENTS = [
    ["Organic Hass Avocado", "Sourdough Bread Slice", "Cherry Tomatoes", "Extra Virgin Olive Oil", "Himalayan Pink Salt", "Cracked Black Pepper"],
    ["Greek Yogurt (Plain)", "Organic Honey", "Chia Seeds", "Fresh Raspberries", "Slivered Almonds"],
    ["Baby Spinach", "Extra Virgin Olive Oil", "Organic Lemon Juice", "Sea Salt", "Pine Nuts"]
  ];

  const triggerAIInstructions = (mealId: string) => {
    setIsGeneratingAI('instructions');
    setTimeout(() => {
      const mockSet = MOCK_AI_INSTRUCTIONS[Math.floor(Math.random() * MOCK_AI_INSTRUCTIONS.length)];
      updateMealInstructions(slot.slotId, mealId, isKids, mockSet);
      setIsGeneratingAI(null);
    }, 1500);
  };

  const triggerAIIngredients = (mealId: string) => {
    setIsGeneratingAI('ingredients');
    setTimeout(() => {
      const mockSet = MOCK_AI_INGREDIENTS[Math.floor(Math.random() * MOCK_AI_INGREDIENTS.length)];
      updateMealIngredients(slot.slotId, mealId, isKids, mockSet);
      setIsGeneratingAI(null);
    }, 1500);
  };

  const handleAddImage = (mealId: string) => {
    setActiveMenuMealId(null);
    const randomImg = FOOD_IMAGES[Math.floor(Math.random() * FOOD_IMAGES.length)];
    updateMealImage(slot.slotId, mealId, isKids, randomImg);
  };

  const handleGenerateImage = (mealId: string) => {
    setActiveMenuMealId(null);
    setGeneratingImageMealId(mealId);
    setTimeout(() => {
      const randomImg = FOOD_IMAGES[Math.floor(Math.random() * FOOD_IMAGES.length)];
      updateMealImage(slot.slotId, mealId, isKids, randomImg);
      setGeneratingImageMealId(null);
    }, 2000);
  };

  const triggerDelete = (mealId: string) => {
    setActiveMenuMealId(null);
    const timeout = setTimeout(() => {
      removeMealOption(slot.slotId, mealId, isKids);
      setPendingDeletions(prev => {
        const next = { ...prev };
        delete next[mealId];
        return next;
      });
    }, 4000);
    
    setPendingDeletions(prev => ({ ...prev, [mealId]: timeout }));
  };

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
        setActiveMenuMealId(null);
        setIsEditingInstructions(false);
        setIsEditingIngredients(false);
      }
    },
    [selectedIndex, onSelectIndex, slot.options.length, CARD_WIDTH]
  );

  const toggleInstructions = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setInstructionsExpanded(!instructionsExpanded);
    setIsEditingInstructions(false);
    if (!instructionsExpanded) {
      setIngredientsExpanded(false);
      setMacrosExpanded(false);
    }
  };

  const toggleIngredients = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIngredientsExpanded(!ingredientsExpanded);
    setIsEditingIngredients(false);
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
    const isMenuOpen = activeMenuMealId === item.id;
    const isGenerating = generatingImageMealId === item.id;
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
          colors={['transparent', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.85)']}
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

        {/* Subtle more button (3 dots) that opens menu */}
        <Pressable 
          style={[styles.moreButton, isMenuOpen && styles.moreButtonActive]}
          onPress={() => {
            setActiveMenuMealId(activeMenuMealId === item.id ? null : item.id);
          }}
        >
          <Ionicons 
            name="ellipsis-horizontal" 
            size={16} 
            color="#FFFFFF" 
          />
        </Pressable>

        {/* Minimal Options Overlay */}
        {isMenuOpen && (
          <View style={[StyleSheet.absoluteFill, styles.menuOverlay]}>
            <View style={styles.menuItemsList}>
              <Pressable style={styles.menuItem} onPress={() => handleAddImage(item.id)}>
                <Ionicons name="image-outline" size={14} color="#FFFFFF" />
                <Text style={styles.menuItemText}>Add Image</Text>
              </Pressable>
              
              <Pressable style={styles.menuItem} onPress={() => handleGenerateImage(item.id)}>
                <Ionicons name="sparkles-outline" size={14} color="#FFFFFF" />
                <Text style={styles.menuItemText}>Generate Image</Text>
              </Pressable>
              
              <Pressable style={[styles.menuItem, styles.menuItemDelete]} onPress={() => triggerDelete(item.id)}>
                <Ionicons name="trash-outline" size={14} color="#FF5B5B" />
                <Text style={[styles.menuItemText, styles.menuItemTextDelete]}>Delete Meal</Text>
              </Pressable>
            </View>

            <Pressable style={styles.menuCloseBtn} onPress={() => setActiveMenuMealId(null)}>
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        )}

        {/* Generating AI Overlay */}
        {isGenerating && (
          <View style={[StyleSheet.absoluteFill, styles.generatingOverlay]}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.generatingText}>Generating AI Visual...</Text>
          </View>
        )}

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
    return (
      <View style={styles.columnBody}>
        <Text style={styles.columnText}>• Protein: {macros.protein}g</Text>
        <Text style={styles.columnText}>• Fats: {macros.fats}g</Text>
        <Text style={styles.columnText}>• Carbs: {macros.carbs}g</Text>
        <Text style={styles.columnText}>• Energy: {macros.calories} kcal</Text>
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
        <Text style={styles.mealHeaderName} numberOfLines={2}>{selected.title}</Text>
        <View style={styles.mealHeaderActions}>
          {/* Book/Recipe Icon */}
          <Pressable 
            style={[styles.actionBtn, instructionsExpanded && styles.actionBtnActive]} 
            onPress={toggleInstructions}
          >
            <Ionicons 
              name={instructionsExpanded ? "book" : "book-outline"} 
              size={16} 
              color={instructionsExpanded ? "#1A1A1A" : "#6B7280"} 
            />
          </Pressable>
          
          {/* List/Ingredients Icon */}
          <Pressable 
            style={[styles.actionBtn, ingredientsExpanded && styles.actionBtnActive]} 
            onPress={toggleIngredients}
          >
            <Ionicons 
              name={ingredientsExpanded ? "list" : "list-outline"} 
              size={18} 
              color={ingredientsExpanded ? "#1A1A1A" : "#6B7280"} 
            />
          </Pressable>

          {/* Info/Nutrition Icon */}
          <Pressable 
            style={[styles.actionBtn, macrosExpanded && styles.actionBtnActive]} 
            onPress={toggleMacros}
          >
            <Ionicons 
              name={macrosExpanded ? "information-circle" : "information-circle-outline"} 
              size={18} 
              color={macrosExpanded ? "#1A1A1A" : "#6B7280"} 
            />
          </Pressable>
        </View>
      </View>

      {/* Expandable Sections Area */}
      <View style={styles.expandedArea}>
        {instructionsExpanded && (
          <View style={styles.expandedSection}>
            {isGeneratingAI === 'instructions' ? (
              <View style={styles.sectionAILoader}>
                <ActivityIndicator size="small" color="#FF7A45" />
                <Text style={styles.sectionAILoaderText}>AI is crafting cooking steps...</Text>
              </View>
            ) : isEditingInstructions ? (
              <View style={styles.editSectionContainer}>
                <View style={styles.editSectionTitleRow}>
                  <Text style={styles.editSectionLabel}>Edit Steps</Text>
                  <Pressable onPress={() => setIsEditingInstructions(false)}>
                    <Ionicons name="close" size={16} color="#9CA3AF" />
                  </Pressable>
                </View>
                {draftInstructions.map((step, idx) => (
                  <View key={idx} style={styles.editInputRow}>
                    <TextInput
                      style={styles.editInput}
                      value={step}
                      placeholder={`Step ${idx + 1}`}
                      onChangeText={(text) => {
                        const copy = [...draftInstructions];
                        copy[idx] = text;
                        setDraftInstructions(copy);
                      }}
                    />
                    <Pressable 
                      onPress={() => {
                        const copy = draftInstructions.filter((_, i) => i !== idx);
                        setDraftInstructions(copy);
                      }}
                      style={styles.editRemoveBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color="#FF5B5B" />
                    </Pressable>
                  </View>
                ))}
                <Pressable 
                  style={styles.editAddBtn}
                  onPress={() => setDraftInstructions([...draftInstructions, ''])}
                >
                  <Ionicons name="add" size={14} color="#374151" />
                  <Text style={styles.editAddBtnText}>Add Step</Text>
                </Pressable>
                
                <View style={styles.editActionsRow}>
                  <Pressable 
                    style={styles.editCancelBtn}
                    onPress={() => setIsEditingInstructions(false)}
                  >
                    <Text style={styles.editCancelBtnText}>Cancel</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.editSaveBtn}
                    onPress={() => {
                      updateMealInstructions(slot.slotId, selected.id, isKids, draftInstructions.filter(s => !!s.trim()));
                      setIsEditingInstructions(false);
                    }}
                  >
                    <Text style={styles.editSaveBtnText}>Save</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.sectionHeaderBar}>
                  <Text style={styles.expandedSectionTitle}>How to cook</Text>
                  <View style={styles.sectionHeaderActions}>
                    <Pressable 
                      style={styles.sectionHeaderBtn} 
                      onPress={() => {
                        setDraftInstructions(selected.instructions);
                        setIsEditingInstructions(true);
                      }}
                    >
                      <Ionicons name="pencil-outline" size={12} color="#4B5563" />
                      <Text style={styles.sectionHeaderBtnText}>Edit</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.columnBody}>
                  {selected.instructions.map((step, i) => (
                    <Text key={i} style={styles.columnText}>{i + 1}. {step}</Text>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {ingredientsExpanded && (
          <View style={styles.expandedSection}>
            {isGeneratingAI === 'ingredients' ? (
              <View style={styles.sectionAILoader}>
                <ActivityIndicator size="small" color="#FF7A45" />
                <Text style={styles.sectionAILoaderText}>AI is compiling ingredients...</Text>
              </View>
            ) : isEditingIngredients ? (
              <View style={styles.editSectionContainer}>
                <View style={styles.editSectionTitleRow}>
                  <Text style={styles.editSectionLabel}>Edit Ingredients</Text>
                  <Pressable onPress={() => setIsEditingIngredients(false)}>
                    <Ionicons name="close" size={16} color="#9CA3AF" />
                  </Pressable>
                </View>
                {draftIngredients.map((ing, idx) => (
                  <View key={idx} style={styles.editInputRow}>
                    <TextInput
                      style={styles.editInput}
                      value={ing}
                      placeholder={`Ingredient ${idx + 1}`}
                      onChangeText={(text) => {
                        const copy = [...draftIngredients];
                        copy[idx] = text;
                        setDraftIngredients(copy);
                      }}
                    />
                    <Pressable 
                      onPress={() => {
                        const copy = draftIngredients.filter((_, i) => i !== idx);
                        setDraftIngredients(copy);
                      }}
                      style={styles.editRemoveBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color="#FF5B5B" />
                    </Pressable>
                  </View>
                ))}
                <Pressable 
                  style={styles.editAddBtn}
                  onPress={() => setDraftIngredients([...draftIngredients, ''])}
                >
                  <Ionicons name="add" size={14} color="#374151" />
                  <Text style={styles.editAddBtnText}>Add Ingredient</Text>
                </Pressable>
                
                <View style={styles.editActionsRow}>
                  <Pressable 
                    style={styles.editCancelBtn}
                    onPress={() => setIsEditingIngredients(false)}
                  >
                    <Text style={styles.editCancelBtnText}>Cancel</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.editSaveBtn}
                    onPress={() => {
                      updateMealIngredients(slot.slotId, selected.id, isKids, draftIngredients.filter(s => !!s.trim()));
                      setIsEditingIngredients(false);
                    }}
                  >
                    <Text style={styles.editSaveBtnText}>Save</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.sectionHeaderBar}>
                  <Text style={styles.expandedSectionTitle}>Ingredients</Text>
                  <View style={styles.sectionHeaderActions}>
                    <Pressable 
                      style={styles.sectionHeaderBtn} 
                      onPress={() => {
                        setDraftIngredients(selected.shoppingList);
                        setIsEditingIngredients(true);
                      }}
                    >
                      <Ionicons name="pencil-outline" size={12} color="#4B5563" />
                      <Text style={styles.sectionHeaderBtnText}>Edit</Text>
                    </Pressable>
                  </View>
                </View>
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

                          {!isHave && (
                            <Pressable 
                              style={[styles.needToBuyPill, isAddedToGrocery && styles.addedPill]}
                              onPress={() => addToGrocery(item)}
                            >
                              <Text style={[styles.needToBuyText, isAddedToGrocery && styles.addedText]}>
                                {isAddedToGrocery ? 'ADDED' : 'TO BUY'}
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
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
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  confirmCheckboxActive: {
    backgroundColor: '#CCFF00',
    borderColor: '#CCFF00',
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
    letterSpacing: 0.4,
  },
  mealHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginHorizontal: CARD_HORIZONTAL_MARGIN,
    marginTop: 7,
    paddingVertical: 4,
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
    backgroundColor: '#CCFF00',
    borderColor: '#CCFF00',
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
    alignItems: 'center',
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
  menuOverlay: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  menuItemsList: {
    width: '80%',
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  menuItemDelete: {
    backgroundColor: 'rgba(255, 91, 91, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 91, 91, 0.3)',
  },
  menuItemText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  menuItemTextDelete: {
    color: '#FF5B5B',
  },
  menuCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  generatingText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  sectionHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sectionHeaderBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionAILoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 122, 69, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 69, 0.15)',
    borderStyle: 'dashed',
  },
  sectionAILoaderText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: '#FF7A45',
  },
  editSectionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  editSectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    paddingBottom: 8,
  },
  editSectionLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#9CA3AF',
  },
  editInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  editInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: '#1F2937',
    fontFamily: 'DMSans_500Medium',
  },
  editRemoveBtn: {
    padding: 4,
  },
  editAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 6,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  editAddBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    color: '#374151',
  },
  editActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  editCancelBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    color: '#4B5563',
  },
  editSaveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#374151',
  },
  editSaveBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
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
