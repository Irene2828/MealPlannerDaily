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
  cereal: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80',
  smoothie: 'https://images.unsplash.com/photo-1553530979-7ee52a2670c4?w=600&q=80',
  oatmeal: 'https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?w=600&q=80',
  fruit: 'https://images.unsplash.com/photo-1490818621748-5b128611f092?w=600&q=80',
  crepe: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&q=80',
};

const getUnsplashImage = (title: string): string => {
  const t = title.toLowerCase();
  for (const key of Object.keys(UNSPLASH_IMAGES)) {
    if (t.includes(key)) return UNSPLASH_IMAGES[key];
  }
  return 'https://images.unsplash.com/photo-1496412705862-a0088f16f791?w=600&q=80';
};

const generateDetails = (title: string): { shoppingList: string[]; instructions: string[] } => {
  const t = title.toLowerCase();
  let shoppingList = ['Salt', 'Black pepper', 'Cooking oil'];
  let instructions = ['Prep your ingredients carefully.', 'Cook in a preheated pan over medium heat.', 'Garnish and serve fresh.'];

  if (t.includes('pancake')) {
    shoppingList = ['1 cup pancake mix', '¾ cup milk', '1 egg', 'Butter', 'Maple syrup'];
    instructions = ['Whisk pancake mix, milk, and egg together.', 'Pour batter onto a hot, greased griddle.', 'Flip when bubbles form, cook until golden.', 'Serve with butter and maple syrup.'];
  } else if (t.includes('egg') || t.includes('scramble') || t.includes('omelet')) {
    shoppingList = ['2 eggs', '1 tbsp butter', 'Salt & pepper', '1 slice bread'];
    instructions = ['Crack eggs into a bowl and whisk with salt.', 'Melt butter in a skillet over low-medium heat.', 'Pour in eggs and scramble gently until soft curls form.', 'Toast bread and serve eggs on top.'];
  } else if (t.includes('toast') || t.includes('avocado')) {
    shoppingList = ['1 ripe avocado', '2 slices bread', 'Lemon juice', 'Chili flakes', 'Cherry tomatoes'];
    instructions = ['Toast bread slices until golden brown.', 'Mash avocado in a bowl with lemon juice and salt.', 'Spread avocado mix onto toast.', 'Top with halved cherry tomatoes and chili flakes.'];
  } else if (t.includes('smoothie')) {
    shoppingList = ['1 banana', '½ cup frozen berries', '1 cup almond milk', '1 tbsp honey'];
    instructions = ['Add banana, berries, milk, and honey to a blender.', 'Blend on high speed until completely smooth.', 'Pour into a tall glass and enjoy cold.'];
  } else if (t.includes('oatmeal') || t.includes('porridge')) {
    shoppingList = ['½ cup rolled oats', '1 cup milk or water', '1 banana, sliced', 'Cinnamon', 'Honey'];
    instructions = ['Combine oats and milk/water in a saucepan.', 'Bring to a gentle boil, then simmer for 5 mins stirring constantly.', 'Pour into a bowl, top with banana slices, honey, and cinnamon.'];
  } else {
    shoppingList = [`Ingredients for ${title}`, 'Fresh herbs', 'Olive oil', 'Garlic'];
    instructions = [`Wash and prepare all ingredients for ${title}.`, `Cook combined items in a pan until done.`, 'Serve hot and season to taste.'];
  }
  return { shoppingList, instructions };
};

export default function SettingsScreen() {
  const { addCustomBreakfasts } = useGrocery();
  const [names, setNames] = useState<string[]>(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [generatedMeals, setGeneratedMeals] = useState<MealOption[]>([]);
  const [success, setSuccess] = useState(false);

  const handleNameChange = (text: string, index: number) => {
    const updated = [...names];
    updated[index] = text;
    setNames(updated);
  };

  const handleGenerate = () => {
    const validNames = names.filter((n) => n.trim() !== '');
    if (validNames.length === 0) {
      alert('Please enter at least one breakfast name!');
      return;
    }

    setLoading(true);
    setSuccess(false);

    // Simulate AI generation lag
    setTimeout(() => {
      const generated: MealOption[] = validNames.map((name, i) => {
        const { shoppingList, instructions } = generateDetails(name);
        return {
          id: `custom-bf-${Date.now()}-${i}`,
          title: name,
          emoji: '🍳',
          moodTag: 'quick',
          moodLabel: 'Custom Meal',
          accentColor: '#10B981',
          gradientFrom: '#059669',
          gradientTo: '#34D399',
          imageUrl: getUnsplashImage(name),
          shoppingList,
          instructions,
        };
      });

      setGeneratedMeals(generated);
      setLoading(false);
    }, 1500);
  };

  const handleUpdateMealField = (index: number, field: 'title' | 'ingredientsText' | 'instructionsText', text: string) => {
    setGeneratedMeals((prev) => {
      const updated = [...prev];
      const meal = { ...updated[index] };
      if (field === 'title') {
        meal.title = text;
      } else if (field === 'ingredientsText') {
        meal.shoppingList = text.split(',').map((x) => x.trim()).filter((x) => x !== '');
      } else if (field === 'instructionsText') {
        meal.instructions = text.split('\n').map((x) => x.trim()).filter((x) => x !== '');
      }
      updated[index] = meal;
      return updated;
    });
  };

  const handleSave = () => {
    if (generatedMeals.length === 0) return;
    addCustomBreakfasts(generatedMeals);
    setGeneratedMeals([]);
    setNames(['', '', '', '', '']);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Create Custom Breakfasts</Text>
        <Text style={styles.sectionSubtitle}>Type up to 5 breakfast ideas you'd like to add to your menu options.</Text>

        <View style={styles.formContainer}>
          {names.map((name, idx) => (
            <TextInput
              key={idx}
              style={styles.input}
              placeholder={`Breakfast option #${idx + 1}`}
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={(txt) => handleNameChange(txt, idx)}
            />
          ))}

          <Pressable 
            style={[styles.btn, loading && styles.btnDisabled]} 
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.btnText}>Generate Visuals & Details</Text>
                <Ionicons name="sparkles-outline" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </Pressable>
        </View>

        {success && (
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
            <Text style={styles.successText}>Successfully added to Breakfast Menu!</Text>
          </View>
        )}

        {generatedMeals.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>Edit & Confirm Your Options</Text>
            {generatedMeals.map((meal, idx) => (
              <View key={meal.id} style={styles.mealCard}>
                <Image source={{ uri: meal.imageUrl }} style={styles.mealImage} />
                <View style={styles.mealForm}>
                  <Text style={styles.label}>Meal Title</Text>
                  <TextInput
                    style={styles.formInput}
                    value={meal.title}
                    onChangeText={(txt) => handleUpdateMealField(idx, 'title', txt)}
                  />

                  <Text style={styles.label}>Ingredients (comma separated)</Text>
                  <TextInput
                    style={[styles.formInput, { height: 60 }]}
                    multiline
                    value={meal.shoppingList.join(', ')}
                    onChangeText={(txt) => handleUpdateMealField(idx, 'ingredientsText', txt)}
                  />

                  <Text style={styles.label}>Instructions (each line is a step)</Text>
                  <TextInput
                    style={[styles.formInput, { height: 100 }]}
                    multiline
                    value={meal.instructions.join('\n')}
                    onChangeText={(txt) => handleUpdateMealField(idx, 'instructionsText', txt)}
                  />
                </View>
              </View>
            ))}

            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Add to Breakfast Menu</Text>
              <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
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
    paddingBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Lora_500Medium',
    fontSize: 20,
    color: '#1A1A1A',
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    fontFamily: 'Lora_500Medium',
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: '#1F2937',
    marginBottom: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    borderRadius: 999,
    paddingVertical: 12,
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  successText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#065F46',
    marginLeft: 8,
  },
  resultsContainer: {
    marginTop: 12,
  },
  resultsHeader: {
    fontFamily: 'Lora_500Medium',
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  mealImage: {
    width: '100%',
    height: 150,
  },
  mealForm: {
    padding: 16,
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#4B5563',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  formInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: '#1F2937',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 999,
    paddingVertical: 14,
    marginTop: 12,
  },
  saveBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
