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
import { SafeAreaView } from 'react-native-safe-area-context';
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

  // selectedDrinks: key = `${mode}-${day}`, value = Set of drink ids
  const [selectedDrinks, setSelectedDrinks] = useState<Record<string, Set<string>>>({});

  const drinkKey = `${mode}-${selectedDay}`;
  const activeDrinks = selectedDrinks[drinkKey] ?? new Set<string>();

  const toggleDrink = (drinkId: string) => {
    setSelectedDrinks(prev => {
      const current = new Set(prev[drinkKey] ?? []);
      if (current.has(drinkId)) {
        current.delete(drinkId);
      } else {
        current.add(drinkId);
      }
      return { ...prev, [drinkKey]: current };
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <Pressable style={styles.headerIconLeft} onPress={() => setMode('adults')}>
            <Ionicons 
              name="people-outline"
              size={26} 
              color={mode === 'adults' ? '#374151' : '#A3A3A3'} 
            />
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {mode === 'adults' ? "Today's Menu" : "Kids Menu"}
            </Text>
            <View style={styles.underlineContainer}>
              <View style={[styles.underlineSegment, { transform: [{ rotate: '-2deg' }], opacity: 0.9 }]} />
              <View style={[styles.underlineSegment, { transform: [{ rotate: '-0.5deg' }], marginTop: -1, opacity: 0.8, width: '90%', alignSelf: 'center' }]} />
            </View>
          </View>

          <Pressable style={styles.headerIconRight} onPress={() => setMode('kids')}>
            <Ionicons 
              name="happy-outline"
              size={26} 
              color={mode === 'kids' ? '#374151' : '#A3A3A3'} 
            />
          </Pressable>
        </View>

        {/* ─── Days of the week strip ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodStrip}
          style={styles.moodStripWrapper}
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
      </SafeAreaView>

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
            if (activeDrinks.has(d.id)) totalCalories += d.cal;
          });
          return (
            <View style={styles.summaryWrapper}>
              {/* Thin orange divider */}
              <View style={styles.summaryDivider} />

              <View style={styles.summaryContent}>
                <Text style={styles.summaryHeading}>Summary</Text>

                {/* Drinks selector row */}
                <View style={styles.drinksRow}>
                  {DRINKS.map(d => {
                    const active = activeDrinks.has(d.id);
                    return (
                      <Pressable key={d.id} style={styles.drinkItem} onPress={() => toggleDrink(d.id)}>
                        <View style={[styles.drinkCircle, active && styles.drinkCircleActive]}>
                          <Text style={styles.drinkEmoji}>{d.emoji}</Text>
                        </View>
                        <Text style={[styles.drinkLabel, active && styles.drinkLabelActive]}>{d.label}</Text>
                        {active && <Text style={styles.drinkCal}>+{d.cal}</Text>}
                      </Pressable>
                    );
                  })}
                </View>

                {/* Total calories big number */}
                <View style={styles.summaryCalRow}>
                  <Text style={styles.summaryCalValue}>{totalCalories}</Text>
                  <Text style={styles.summaryCalUnit}> kcal</Text>
                </View>

                {/* Macro bars */}
                {[
                  { label: 'Protein', val: totalProtein, unit: 'g', color: '#FF7A45' },
                  { label: 'Fats',    val: totalFats,    unit: 'g', color: '#CCFF00' },
                  { label: 'Carbs',   val: totalCarbs,   unit: 'g', color: '#00E5FF' },
                ].map(m => {
                  const maxPossible = 60;
                  const pct = Math.min((m.val / maxPossible) * 100, 100);
                  return (
                    <View key={m.label} style={styles.summaryMacroRow}>
                      <Text style={styles.summaryMacroLabel}>{m.label}</Text>
                      <View style={styles.summaryBarBg}>
                        <View
                          style={[styles.summaryBarFill, { width: `${pct}%` as any, backgroundColor: m.color }]}
                        />
                      </View>
                      <Text style={styles.summaryMacroVal}>{m.val}g</Text>
                    </View>
                  );
                })}
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
  safeArea: {
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    position: 'relative',
  },
  headerIconLeft: {
    position: 'absolute',
    left: 24,
    padding: 8, // Increase touch target
  },
  headerIconRight: {
    position: 'absolute',
    right: 24,
    padding: 8, // Increase touch target
  },
  headerTitleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Lora_500Medium', // Elegant serif font, less thick than Fraunces Black
    fontSize: 20,
    color: '#1A1A1A',
    lineHeight: 26,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  underlineContainer: {
    position: 'absolute',
    bottom: -6,
    left: '10%',
    right: '10%',
    height: 6,
  },
  underlineSegment: {
    height: 2,
    backgroundColor: '#FF7A45',
    borderRadius: 999,
    width: '100%',
  },
  moodStripWrapper: {
    flexGrow: 0,
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
    backgroundColor: '#FF7A45',
    borderRadius: 999,
    opacity: 0.6,
    marginBottom: 20,
  },
  summaryContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#FF7A45',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeading: {
    fontFamily: 'Lora_500Medium',
    fontSize: 17,
    color: '#1A1A1A',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  summaryCalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  summaryCalValue: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 42,
    color: '#FF7A45',
    lineHeight: 46,
  },
  summaryCalUnit: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 4,
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
  drinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  drinkItem: {
    alignItems: 'center',
    gap: 5,
  },
  drinkCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  drinkCircleActive: {
    backgroundColor: '#E5E7EB',
    borderColor: '#4B5563',
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
  drinkCal: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    color: '#FF7A45',
  },
});

