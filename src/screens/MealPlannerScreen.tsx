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
import { MealCarouselRow } from '../components/MealCarouselRow';

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

export default function MealPlannerScreen() {
  const [selectedDay, setSelectedDay] = useState('mon');
  const [mode, setMode] = useState<'adults' | 'kids'>('adults');
  
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

  const currentSlots = mode === 'adults' ? MEAL_SLOTS : KIDS_MEAL_SLOTS;
  const currentIndices = mode === 'adults' ? adultsIndices : kidsIndices;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <Pressable style={styles.headerIconLeft} onPress={() => setMode('adults')}>
            <Ionicons 
              name={mode === 'adults' ? 'people' : 'people-outline'} 
              size={26} 
              color={mode === 'adults' ? '#374151' : '#A3A3A3'} 
            />
          </Pressable>

          <Text style={styles.headerTitle}>Today's Menu</Text>

          <Pressable style={styles.headerIconRight} onPress={() => setMode('kids')}>
            <Ionicons 
              name={mode === 'kids' ? 'happy' : 'happy-outline'} 
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
            slot={slot}
            selectedIndex={Math.min(
              currentIndices[slot.slotId] ?? 0,
              slot.options.length - 1
            )}
            onSelectIndex={(index) => handleSelectIndex(slot.slotId, index)}
          />
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FEF8F0',
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
  headerTitle: {
    fontFamily: 'Lora_500Medium', // Elegant serif font, less thick than Fraunces Black
    fontSize: 32,
    color: '#1A1A1A',
    lineHeight: 40,
    letterSpacing: -0.3,
    textAlign: 'center',
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
});

