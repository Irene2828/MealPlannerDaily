import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGrocery } from '../context/GroceryContext';
import { MealOption } from '../data/meals';

const UNSPLASH_IMAGES: Record<string, string> = {
  pancake: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',
  waffle: 'https://images.unsplash.com/photo-1562376502-6f769499c886?w=600&q=80',
  egg: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80',
  toast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80',
  smoothie: 'https://images.unsplash.com/photo-1553530979-7ee52a2670c4?w=600&q=80',
  oatmeal: 'https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?w=600&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  sandwich: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&q=80',
  soup: 'https://images.unsplash.com/photo-1547592165-e1d17fed6006?w=600&q=80',
  pasta: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
  steak: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
  taco: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
  salmon: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80',
};

const getUnsplashImage = (title: string, category: string): string => {
  const t = title.toLowerCase();
  for (const key of Object.keys(UNSPLASH_IMAGES)) {
    if (t.includes(key)) return UNSPLASH_IMAGES[key];
  }
  
  if (category === 'breakfast') return 'https://images.unsplash.com/photo-1496412705862-a0088f16f791?w=600&q=80';
  if (category === 'snack') return 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80';
  if (category === 'lunch') return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80';
};

const generateDetails = (title: string, category: string): { shoppingList: string[]; instructions: string[] } => {
  const t = title.toLowerCase();
  
  if (category === 'breakfast') {
    if (t.includes('pancake')) {
      return {
        shoppingList: ['Pancake mix', 'Milk', '1 egg', 'Maple syrup'],
        instructions: ['Whisk ingredients together.', 'Cook on a hot buttered griddle.', 'Serve with syrup.']
      };
    }
    return {
      shoppingList: ['Eggs', 'Butter', 'Bread toast'],
      instructions: ['Scramble eggs in butter.', 'Serve warm with toast.']
    };
  }
  
  if (category === 'snack') {
    return {
      shoppingList: ['Mixed berries', 'Greek yogurt', 'Honey'],
      instructions: ['Layer yogurt and berries in a bowl.', 'Drizzle with honey and serve.']
    };
  }

  if (category === 'lunch') {
    if (t.includes('salad')) {
      return {
        shoppingList: ['Romaine lettuce', 'Cherry tomatoes', 'Cucumber', 'Olive oil'],
        instructions: ['Chop vegetables.', 'Toss in a bowl with olive oil dressing.']
      };
    }
    return {
      shoppingList: ['Bread slices', 'Sliced turkey', 'Cheese', 'Mayo'],
      instructions: ['Assemble sandwich with turkey and cheese.', 'Toast lightly if desired.']
    };
  }

  if (t.includes('pasta')) {
    return {
      shoppingList: ['Pasta noodles', 'Marinara sauce', 'Parmesan cheese'],
      instructions: ['Boil pasta until al dente.', 'Drain and mix with heated marinara.', 'Top with cheese.']
    };
  }
  return {
    shoppingList: ['Chicken breast', 'Asparagus', 'Olive oil', 'Garlic'],
    instructions: ['Season chicken and asparagus.', 'Pan-sear chicken until cooked through.', 'Roast asparagus and serve.']
  };
};

type MealInputs = Record<string, string[]>;

export default function SettingsScreen() {
  const { addCustomMeals } = useGrocery();
  
  const [inputs, setInputs] = useState<MealInputs>({
    breakfast: [''],
    snack: [''],
    lunch: [''],
    dinner: [''],
  });

  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const [generatedMeals, setGeneratedMeals] = useState<Record<string, MealOption>>({});
  const [expandedSection, setExpandedSection] = useState<Record<string, 'recipe' | 'list' | 'macros' | null>>({});
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleAddInput = (category: string) => {
    setInputs((prev) => ({
      ...prev,
      [category]: [...prev[category], ''],
    }));
  };

  const handleRemoveInput = (category: string, index: number) => {
    setInputs((prev) => {
      const categoryInputs = [...prev[category]];
      categoryInputs.splice(index, 1);
      return {
        ...prev,
        [category]: categoryInputs.length > 0 ? categoryInputs : [''],
      };
    });
  };

  const handleTextChange = (category: string, index: number, text: string) => {
    setInputs((prev) => {
      const categoryInputs = [...prev[category]];
      categoryInputs[index] = text;
      return {
        ...prev,
        [category]: categoryInputs,
      };
    });
  };

  const handleGenerateSingle = (category: string, index: number) => {
    const text = inputs[category][index];
    if (!text.trim()) return;

    const key = `${category}-${index}`;
    setLoadingItems(prev => ({ ...prev, [key]: true }));

    setTimeout(() => {
      const { shoppingList, instructions } = generateDetails(text, category);
      const meal = {
        id: `custom-${category}-${Date.now()}-${index}`,
        title: text,
        emoji: '🍳',
        moodTag: 'quick' as any,
        moodLabel: 'Custom Meal',
        accentColor: '#374151',
        gradientFrom: '#374151',
        gradientTo: '#4B5563',
        imageUrl: getUnsplashImage(text, category),
        shoppingList,
        instructions,
      };
      
      setGeneratedMeals(prev => ({ ...prev, [key]: meal }));
      setLoadingItems(prev => ({ ...prev, [key]: false }));
    }, 1200);
  };

  const handleSaveSingle = (category: string, index: number) => {
    const key = `${category}-${index}`;
    const meal = generatedMeals[key];
    if (meal) {
      addCustomMeals(category, [meal]);
      
      setGeneratedMeals(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      
      setInputs(prev => {
        const catInputs = [...prev[category]];
        catInputs[index] = '';
        return { ...prev, [category]: catInputs };
      });
    }
  };

  const handleTrashSingle = (category: string, index: number) => {
    const key = `${category}-${index}`;
    setGeneratedMeals(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleSection = (key: string, section: 'recipe' | 'list' | 'macros') => {
    setExpandedSection(prev => ({
      ...prev,
      [key]: prev[key] === section ? null : section,
    }));
  };

  const renderInputSection = (category: string, label: string) => {
    const categoryInputs = inputs[category] || [''];
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>{label}</Text>
          <Pressable onPress={() => handleAddInput(category)} style={styles.plusButton}>
            <Ionicons name="add" size={18} color="#374151" />
          </Pressable>
        </View>

        {categoryInputs.map((val, idx) => {
          const key = `${category}-${idx}`;
          const isGenerating = loadingItems[key];
          const generatedMeal = generatedMeals[key];
          const activeSection = expandedSection[key] ?? null;

          return (
            <View key={idx} style={styles.inputItemContainer}>
              {/* Minimal name row + 3 icons */}
              <View style={[styles.inputWrapper, focusedInput === key && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="Meal name..."
                  placeholderTextColor="#9CA3AF"
                  value={val}
                  onChangeText={(txt) => handleTextChange(category, idx, txt)}
                  onFocus={() => setFocusedInput(key)}
                  onBlur={() => setFocusedInput(null)}
                />

                {/* Generate full meal */}
                <Pressable
                  style={[styles.aiBtn, { marginLeft: 8, paddingVertical: 6, paddingHorizontal: 12 }, (!val.trim() || isGenerating) && styles.btnDisabled]}
                  onPress={() => handleGenerateSingle(category, idx)}
                  disabled={isGenerating || !val.trim()}
                >
                  {isGenerating ? (
                    <ActivityIndicator color="#374151" size="small" />
                  ) : (
                    <>
                      <Ionicons name="sparkles-outline" size={13} color="#374151" />
                      <Text style={[styles.aiBtnText, { fontSize: 11 }]}>Create with AI</Text>
                    </>
                  )}
                </Pressable>

                {categoryInputs.length > 1 && (
                  <Pressable onPress={() => handleRemoveInput(category, idx)} style={styles.removeButton}>
                    <Ionicons name="close-circle" size={18} color="#D1D5DB" />
                  </Pressable>
                )}
              </View>

              {/* Expandable panels removed per minimalist flow */}

              {generatedMeal && (
                 <View style={styles.mealCard}>
                   <Image source={{ uri: generatedMeal.imageUrl }} style={styles.mealImageSmall} />
                   <View style={styles.mealCardContent}>
                     <Text style={styles.mealCardTitle} numberOfLines={1}>{generatedMeal.title}</Text>
                     <Text style={styles.mealCardSub} numberOfLines={1}>
                       {generatedMeal.shoppingList.length} items • {generatedMeal.instructions.length} steps
                     </Text>
                   </View>
                   <Pressable style={styles.sendMenuBtn} onPress={() => handleSaveSingle(category, idx)}>
                     <Text style={styles.sendMenuBtnText}>Add to Menu</Text>
                     <Ionicons name="add-outline" size={14} color="#374151" style={{ marginLeft: 4 }} />
                   </Pressable>
                   <Pressable style={styles.trashBtn} onPress={() => handleTrashSingle(category, idx)}>
                     <Ionicons name="trash-outline" size={16} color="#374151" />
                   </Pressable>
                 </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderInputSection('breakfast', 'Breakfast')}
        {renderInputSection('snack', 'Snacks')}
        {renderInputSection('lunch', 'Lunch')}
        {renderInputSection('dinner', 'Dinner')}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#374151',
  },
  plusButton: {
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputItemContainer: {
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  inputWrapperFocused: {
    borderColor: '#FF7A45',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: '#1F2937',
    paddingVertical: 8,
  },
  inlineGenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  inlineGenerateBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#374151',
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  iconBtnActive: {
    backgroundColor: '#FDE6D4',
    borderColor: '#FF7A45',
  },
  iconBtnGenerate: {
    backgroundColor: '#FDE6D4',
    borderColor: '#FF7A45',
  },
  expandPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  expandPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expandPanelLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  expandPanelText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 4,
    opacity: 0.8,
  },
  expandIngredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  expandBullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FF7A45',
    flexShrink: 0,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#FF7A45',
    backgroundColor: 'rgba(255,122,69,0.05)',
  },
  aiBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  macroLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: '#6B7280',
    width: 50,
  },
  macroBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%' as any,
    borderRadius: 3,
  },
  macroVal: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#1F2937',
    width: 32,
    textAlign: 'right',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  removeButton: {
    padding: 4,
    marginLeft: 4,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  mealImageSmall: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  mealCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  mealCardTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  mealCardSub: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: '#6B7280',
  },
  sendMenuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginLeft: 8,
  },
  sendMenuBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    color: '#374151',
  },
  trashBtn: {
    padding: 6,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
