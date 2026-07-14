import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MEAL_SLOTS, MealOption } from '../data/meals';
import { MealCarouselRow } from '../components/MealCarouselRow';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOODS = [
  { id: 'all', label: 'All vibes', emoji: '✨' },
  { id: 'cozy', label: 'Cozy', emoji: '🛋️' },
  { id: 'energized', label: 'Energized', emoji: '⚡' },
  { id: 'light', label: 'Light', emoji: '🌿' },
  { id: 'indulgent', label: 'Indulgent', emoji: '🍫' },
  { id: 'quick', label: 'Quick', emoji: '⏱️' },
];

export default function MealPlannerScreen() {
  const [selectedMood, setSelectedMood] = useState('all');
  const [selectedIndices, setSelectedIndices] = useState<Record<string, number>>(
    Object.fromEntries(MEAL_SLOTS.map((s) => [s.slotId, 0]))
  );

  const handleSelectMood = (moodId: string) => {
    setSelectedMood(moodId);
  };

  const handleSelectIndex = (slotId: string, index: number) => {
    setSelectedIndices((prev) => ({ ...prev, [slotId]: index }));
  };

  const filteredSlots = MEAL_SLOTS.map((slot) => ({
    ...slot,
    options:
      selectedMood === 'all'
        ? slot.options
        : slot.options.filter((o) => o.moodTag === selectedMood),
  })).filter((slot) => slot.options.length > 0);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerEyebrow}>Today's plan</Text>
            <Text style={styles.headerTitle}>What do you{'\n'}feel like? 🍴</Text>
          </View>
        </View>

        {/* ─── Mood filter strip ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodStrip}
          style={styles.moodStripWrapper}
        >
          {MOODS.map((mood) => {
            const active = selectedMood === mood.id;
            return (
              <Pressable
                key={mood.id}
                onPress={() => handleSelectMood(mood.id)}
                style={[styles.moodChip, active && styles.moodChipActive]}
              >
                <Text style={styles.moodChipEmoji}>{mood.emoji}</Text>
                <Text style={[styles.moodChipLabel, active && styles.moodChipLabelActive]}>
                  {mood.label}
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
        {filteredSlots.map((slot) => (
          <MealCarouselRow
            key={slot.slotId}
            slot={slot}
            selectedIndex={Math.min(
              selectedIndices[slot.slotId] ?? 0,
              slot.options.length - 1
            )}
            onSelectIndex={(index) => handleSelectIndex(slot.slotId, index)}
          />
        ))}

        {filteredSlots.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🥺</Text>
            <Text style={styles.emptyText}>No meals match this vibe.</Text>
            <Text style={styles.emptySubText}>Try a different mood filter!</Text>
          </View>
        )}

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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerEyebrow: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#888',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 30,
    color: '#1A1A1A',
    lineHeight: 36,
    letterSpacing: -0.5,
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

