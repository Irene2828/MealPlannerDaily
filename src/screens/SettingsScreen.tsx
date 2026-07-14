import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  // Dinner
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
  
  // Dynamic inputs state for each category
  const [inputs, setInputs] = useState<MealInputs>({
    breakfast: [''],
    snack: [''],
    lunch: [''],
    dinner: [''],
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Generated meals ready for preview and editing, keyed by slotId
  const [generatedMeals, setGeneratedMeals] = useState<Record<string, MealOption[]>>({});

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

  const handleGenerate = () => {
    // Collect all valid inputs
    const generationPayload: Record<string, string[]> = {};
    let totalItems = 0;

    Object.keys(inputs).forEach((cat) => {
      const valid = inputs[cat].filter((v) => v.trim() !== '');
      if (valid.length > 0) {
        generationPayload[cat] = valid;
        totalItems += valid.length;
      }
    });

    if (totalItems === 0) {
      alert('Please enter at least one meal option!');
      return;
    }

    setLoading(true);
    setSuccess(false);

    // Simulate AI generation lag
    setTimeout(() => {
      const results: Record<string, MealOption[]> = {};
      
      Object.keys(generationPayload).forEach((cat) => {
        results[cat] = generationPayload[cat].map((name, i) => {
          const { shoppingList, instructions } = generateDetails(name, cat);
          return {
            id: `custom-${cat}-${Date.now()}-${i}`,
            title: name,
            emoji: '🍳',
            moodTag: 'quick',
            moodLabel: 'Custom Meal',
            accentColor: '#374151',
            gradientFrom: '#374151',
            gradientTo: '#4B5563',
            imageUrl: getUnsplashImage(name, cat),
            shoppingList,
            instructions,
          };
        });
      });

      setGeneratedMeals(results);
      setLoading(false);
    }, 1200);
  };

  const handleUpdateGeneratedField = (
    category: string,
    index: number,
    field: 'title' | 'ingredientsText' | 'instructionsText',
    text: string
  ) => {
    setGeneratedMeals((prev) => {
      const categoryMeals = [...(prev[category] || [])];
      const meal = { ...categoryMeals[index] };
      
      if (field === 'title') {
        meal.title = text;
      } else if (field === 'ingredientsText') {
        meal.shoppingList = text.split(',').map((x) => x.trim()).filter((x) => x !== '');
      } else if (field === 'instructionsText') {
        meal.instructions = text.split('\n').map((x) => x.trim()).filter((x) => x !== '');
      }
      
      categoryMeals[index] = meal;
      return {
        ...prev,
        [category]: categoryMeals,
      };
    });
  };

  const handleSave = () => {
    // Add all generated meals to their respective slots
    Object.keys(generatedMeals).forEach((cat) => {
      if (generatedMeals[cat] && generatedMeals[cat].length > 0) {
        addCustomMeals(cat, generatedMeals[cat]);
      }
    });

    setGeneratedMeals({});
    setInputs({
      breakfast: [''],
      snack: [''],
      lunch: [''],
      dinner: [''],
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const renderInputSection = (category: string, label: string) => {
    const categoryInputs = inputs[category] || [''];
    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>{label}</Text>
          <Pressable onPress={() => handleAddInput(category)} style={styles.plusButton}>
            <Ionicons name="add" size={18} color="#374151" />
          </Pressable>
        </View>

        {categoryInputs.map((val, idx) => (
          <View key={idx} style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={`Add meal option`}
              placeholderTextColor="#9CA3AF"
              value={val}
              onChangeText={(txt) => handleTextChange(category, idx, txt)}
            />
            {categoryInputs.length > 1 && (
              <Pressable onPress={() => handleRemoveInput(category, idx)} style={styles.removeButton}>
                <Ionicons name="close-outline" size={18} color="#9CA3AF" />
              </Pressable>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add New Meals</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {renderInputSection('breakfast', 'Breakfast')}
        {renderInputSection('snack', 'Snacks')}
        {renderInputSection('lunch', 'Lunch')}
        {renderInputSection('dinner', 'Dinner')}

        <Pressable 
          style={[styles.generateBtn, loading && styles.btnDisabled]} 
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#374151" size="small" />
          ) : (
            <>
              <Ionicons name="image-outline" size={16} color="#374151" style={{ marginRight: 4 }} />
              <Ionicons name="restaurant-outline" size={16} color="#374151" style={{ marginRight: 4 }} />
              <Ionicons name="list-outline" size={16} color="#374151" style={{ marginRight: 8 }} />
              <Text style={styles.generateBtnText}>Generate Visual, Recipe & List</Text>
              <Ionicons name="sparkles-outline" size={15} color="#374151" style={{ marginLeft: 6 }} />
            </>
          )}
        </Pressable>

        {success && (
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
            <Text style={styles.successText}>Successfully added to your Menu options!</Text>
          </View>
        )}

        {Object.keys(generatedMeals).length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>Confirm Generated Options</Text>
            
            {Object.keys(generatedMeals).map((cat) => (
              <View key={cat}>
                {generatedMeals[cat].map((meal, idx) => (
                  <View key={meal.id} style={styles.mealCard}>
                    <Image source={{ uri: meal.imageUrl }} style={styles.mealImage} />
                    <View style={styles.mealForm}>
                      <TextInput
                        style={styles.mealTitleInput}
                        value={meal.title}
                        onChangeText={(txt) => handleUpdateGeneratedField(cat, idx, 'title', txt)}
                        placeholder="Meal title"
                      />

                      <Text style={styles.label}>Ingredients (comma separated)</Text>
                      <TextInput
                        style={[styles.formInput, { height: 50 }]}
                        multiline
                        value={meal.shoppingList.join(', ')}
                        onChangeText={(txt) => handleUpdateGeneratedField(cat, idx, 'ingredientsText', txt)}
                      />

                      <Text style={styles.label}>Instructions (each line is a step)</Text>
                      <TextInput
                        style={[styles.formInput, { height: 80 }]}
                        multiline
                        value={meal.instructions.join('\n')}
                        onChangeText={(txt) => handleUpdateGeneratedField(cat, idx, 'instructionsText', txt)}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ))}

            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="paper-plane-outline" size={16} color="#374151" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>Ship to Menu Options</Text>
            </Pressable>
          </View>
        )}

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
  safeArea: {
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Lora_500Medium',
    fontSize: 20,
    color: '#1A1A1A',
    lineHeight: 26,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 12,
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
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    color: '#1F2937',
  },
  removeButton: {
    padding: 6,
    marginLeft: 6,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 999,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  generateBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#374151',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  successText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#065F46',
    marginLeft: 6,
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsHeader: {
    fontFamily: 'Lora_500Medium',
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 16,
  },
  mealImage: {
    width: '100%',
    height: 120,
  },
  mealForm: {
    padding: 12,
  },
  mealTitleInput: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 4,
    marginBottom: 10,
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    color: '#1F2937',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 999,
    paddingVertical: 14,
    marginTop: 8,
  },
  saveBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#374151',
  },
});
