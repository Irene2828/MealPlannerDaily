import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MEAL_SLOTS } from '../data/meals';
import { KIDS_MEAL_SLOTS } from '../data/kidsMeals';
import { MealCarouselRow, getMealMacrosObj } from '../components/MealCarouselRow';
import { useGrocery } from '../context/GroceryContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DAYS_OF_WEEK = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
];

const DRINKS = [
  { id: 'espresso',  label: 'Espresso',  emoji: '☕',  cal: 5   },
  { id: 'latte',     label: 'Latte',     emoji: '🥛',  cal: 80  },
  { id: 'juice',     label: 'Juice',     emoji: '🍊',  cal: 110 },
  { id: 'milk',      label: 'Milk',      emoji: '🍼',  cal: 120 },
  { id: 'smoothie',  label: 'Smoothie',  emoji: '🫙',  cal: 180 },
];

export default function MealPlannerScreen() {
  const [selectedDay, setSelectedDay] = useState('mon');
  const [mode, setMode] = useState<'adults' | 'kids'>('adults');
  const { adultsMeals, kidsMeals } = useGrocery();
  
  // Create indices state for both sets of data independently
  const [adultsIndices, setAdultsIndices] = useState<Record<string, number>>(
    Object.fromEntries(MEAL_SLOTS.map((s) => [s.slotId, 0]))
  );
  const [kidsIndices, setKidsIndices] = useState<Record<string, number>>(
    Object.fromEntries(KIDS_MEAL_SLOTS.map((s) => [s.slotId, 0]))
  );

  const handleSelectDay = (dayId: string) => {
    setSelectedDay(dayId);
  };

  const handleSelectIndex = (slotId: string, index: number) => {
    if (mode === 'adults') {
      setAdultsIndices((prev) => ({ ...prev, [slotId]: index }));
    } else {
      setKidsIndices((prev) => ({ ...prev, [slotId]: index }));
    }
  };

  const currentSlots = mode === 'adults' ? adultsMeals : kidsMeals;
  const currentIndices = mode === 'adults' ? adultsIndices : kidsIndices;

  // selectedDrinks: key = `${mode}-${day}`, value = record of drinkId -> count
  const [selectedDrinks, setSelectedDrinks] = useState<Record<string, Record<string, number>>>({});

  const drinkKey = `${mode}-${selectedDay}`;
  const activeDrinks = selectedDrinks[drinkKey] ?? {};

  const incrementDrink = (drinkId: string) => {
    setSelectedDrinks(prev => {
      const current = { ...(prev[drinkKey] || {}) };
      current[drinkId] = (current[drinkId] || 0) + 1;
      return { ...prev, [drinkKey]: current };
    });
  };

  const decrementDrink = (drinkId: string) => {
    setSelectedDrinks(prev => {
      const current = { ...(prev[drinkKey] || {}) };
      if (!current[drinkId]) return prev;
      current[drinkId] -= 1;
      if (current[drinkId] === 0) delete current[drinkId];
      return { ...prev, [drinkKey]: current };
    });
  };

  const handleTapDrink = (drinkId: string) => {
    setSelectedDrinks(prev => {
      const current = { ...(prev[drinkKey] || {}) };
      const currentCount = current[drinkId] || 0;
      if (currentCount > 0) {
        delete current[drinkId];
      } else {
        current[drinkId] = 1;
      }
      return { ...prev, [drinkKey]: current };
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />


      {/* ─── Days of the week strip ─── */}
      <View style={styles.moodStripWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodStrip}
        >
          {DAYS_OF_WEEK.map((day) => {
            const active = selectedDay === day.id;
            return (
              <Pressable
                key={day.id}
                onPress={() => handleSelectDay(day.id)}
                style={[styles.moodChip, active && styles.moodChipActive]}
              >
                <Text style={[styles.moodChipLabel, active && styles.moodChipLabelActive]}>
                  {day.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── Main scroll ─── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentSlots.map((slot) => (
          <MealCarouselRow
            key={slot.slotId}
            day={selectedDay}
            slot={slot}
            isKids={mode === 'kids'}
            selectedIndex={Math.min(
              currentIndices[slot.slotId] ?? 0,
              slot.options.length - 1
            )}
            onSelectIndex={(index) => handleSelectIndex(slot.slotId, index)}
          />
        ))}

        {/* ── Daily Summary ── */}
        {(() => {
          let totalCalories = 0, totalProtein = 0, totalFats = 0, totalCarbs = 0;
          currentSlots.forEach(slot => {
            const idx = Math.min(currentIndices[slot.slotId] ?? 0, slot.options.length - 1);
            const meal = slot.options[idx];
            if (meal) {
              const m = getMealMacrosObj(meal.title, meal.id);
              totalCalories += m.calories;
              totalProtein += m.protein;
              totalFats += m.fats;
              totalCarbs += m.carbs;
            }
          });
          // Add selected drink calories
          DRINKS.forEach(d => {
            const count = activeDrinks[d.id] || 0;
            totalCalories += count * d.cal;
          });
          return (
            <View style={styles.summaryWrapper}>
              {/* Thin orange divider */}
              <View style={styles.summaryDivider} />

              <View style={styles.summaryContent}>

                {/* Macros left + calories right */}
                <View style={styles.summaryMainRow}>
                  {/* Macro bars column */}
                  <View style={styles.summaryMacroColumn}>
                    {[
                      { label: 'Protein', val: totalProtein, color: '#9CA3AF' },
                      { label: 'Fats',    val: totalFats,    color: '#D1D5DB' },
                      { label: 'Carbs',   val: totalCarbs,   color: '#E5E7EB' },
                    ].map(m => {
                      const pct = Math.min((m.val / 60) * 100, 100);
                      return (
                        <View key={m.label} style={styles.summaryMacroRow}>
                          <Text style={styles.summaryMacroLabel}>{m.label}</Text>
                          <View style={styles.summaryBarBg}>
                            <View style={[styles.summaryBarFill, { width: `${pct}%` as any, backgroundColor: m.color }]} />
                          </View>
                          <Text style={styles.summaryMacroVal}>{m.val}g</Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Calories right column */}
                  <View style={styles.summaryCalColumn}>
                    <Text style={styles.summaryCalValue}>{totalCalories}</Text>
                    <Text style={styles.summaryCalUnit}>kcal</Text>
                  </View>
                </View>

                {/* Drinks selector container with top border and horizontal ScrollView */}
                <View style={styles.drinksContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.drinksScrollContent}
                  >
                    {DRINKS.map(d => {
                      const count = activeDrinks[d.id] || 0;
                      return (
                        <View key={d.id} style={styles.drinkItem}>
                          <Pressable onPress={() => handleTapDrink(d.id)}>
                            <View style={[styles.drinkCircle, count > 0 && styles.drinkCircleActive]}>
                              <Text style={styles.drinkEmoji}>{d.emoji}</Text>
                            </View>
                          </Pressable>
                          <Text style={[styles.drinkLabel, count > 0 && styles.drinkLabelActive]}>{d.label}</Text>
                          
                          {/* Digit under the icon/label */}
                          <Text style={styles.drinkCount}>{count}</Text>

                          {/* Minus and Plus controls */}
                          <View style={styles.drinkControls}>
                            <Pressable onPress={() => decrementDrink(d.id)} style={styles.drinkBtn}>
                              <Ionicons name="remove" size={12} color="#6B7280" />
                            </Pressable>
                            <Pressable onPress={() => incrementDrink(d.id)} style={styles.drinkBtn}>
                              <Ionicons name="add" size={12} color="#6B7280" />
                            </Pressable>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </View>
          );
        })()}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  moodStripWrapper: {
    flexGrow: 0,
    marginTop: 24,
  },
  moodStrip: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  moodChipActive: {
    backgroundColor: '#FF7A45',
    borderColor: '#FF7A45',
  },
  moodChipEmoji: {
    fontSize: 15,
    marginRight: 6,
  },
  moodChipLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: '#666',
  },
  moodChipLabelActive: {
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: 6,
  },
  emptySubText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#666',
  },
  summaryWrapper: {
    marginTop: 16,
    marginHorizontal: 20,
  },
  summaryDivider: {
    height: 2,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    marginBottom: 20,
  },
  summaryContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
  },
  summaryMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryMacroColumn: {
    flex: 1,
  },
  summaryCalColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#F3F4F6',
    minWidth: 64,
  },
  summaryCalValue: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 30,
    color: '#4B5563',
    lineHeight: 34,
    textAlign: 'right',
  },
  summaryCalUnit: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 1,
  },
  summaryMacroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  summaryMacroLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#4B5563',
    width: 52,
  },
  summaryBarBg: {
    flex: 1,
    height: 7,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  summaryBarFill: {
    height: '100%' as any,
    borderRadius: 4,
  },
  summaryMacroVal: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#1F2937',
    width: 36,
    textAlign: 'right',
  },
  drinksContainer: {
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  drinksScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    gap: 16,
    paddingHorizontal: 8,
  },
  drinkItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: 56,
  },
  drinkCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  drinkCircleActive: {
    borderColor: '#4B5563',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
  },
  drinkControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  drinkBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drinkCount: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#374151',
    marginTop: 2,
    textAlign: 'center',
  },
  drinkEmoji: {
    fontSize: 20,
  },
  drinkLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    color: '#9CA3AF',
  },
  drinkLabelActive: {
    color: '#374151',
    fontFamily: 'DMSans_700Bold',
  },

});

