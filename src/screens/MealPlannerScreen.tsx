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
import { MEAL_SLOTS, MealOption } from '../data/meals';
import { MealCarouselRow } from '../components/MealCarouselRow';
import { useMenuChoices, PROFILES, Profile, profileLabel, PROFILE_COLORS } from '../hooks/useMenuChoices';
import type { Lang } from '../hooks/useLanguage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DAYS_OF_WEEK = [
  { id: 'mon', uk: 'Пн', en: 'Mon' },
  { id: 'tue', uk: 'Вт', en: 'Tue' },
  { id: 'wed', uk: 'Ср', en: 'Wed' },
  { id: 'thu', uk: 'Чт', en: 'Thu' },
  { id: 'fri', uk: 'Пт', en: 'Fri' },
  { id: 'sat', uk: 'Сб', en: 'Sat' },
  { id: 'sun', uk: 'Нд', en: 'Sun' },
];

export default function MealPlannerScreen({ lang }: { lang: Lang }) {
  const [selectedDay, setSelectedDay] = useState('mon');
  const [selectedProfile, setSelectedProfile] = useState<Profile>('Tato');

  const { setChoice, getChoice, getChoicesForDay } = useMenuChoices();

  const dayLabel = (id: string) => {
    const d = DAYS_OF_WEEK.find(d => d.id === id);
    if (!d) return id;
    return lang === 'uk' ? d.uk : d.en;
  };

  const mealTitle = (meal: MealOption) =>
    lang === 'en' && meal.titleEn ? meal.titleEn : meal.title;

  const summaryTitle =
    lang === 'uk' ? `Вибір на ${dayLabel(selectedDay)}` : `Choices for ${dayLabel(selectedDay)}`;

  const handleSelectIndex = (slotId: string, index: number) => {
    // We get index from carousel, map it to the actual mealId
    const slot = MEAL_SLOTS.find(s => s.slotId === slotId);
    if (!slot) return;
    const mealId = slot.options[index]?.id || null;

    setChoice(selectedDay, selectedProfile, slotId, mealId);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Profiles */}
      <View style={styles.profilesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profilesScroll}>
          {PROFILES.map((profile) => (
            <Pressable
              key={profile}
              style={[
                styles.profileChip,
                selectedProfile === profile && {
                  backgroundColor: PROFILE_COLORS[profile],
                  borderColor: PROFILE_COLORS[profile],
                },
              ]}
              onPress={() => setSelectedProfile(profile)}
            >
              <Text
                style={[
                  styles.profileChipLabel,
                  selectedProfile === profile && styles.profileChipLabelActive,
                ]}
              >
                {profileLabel(profile, lang)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Days Scroll */}
      <View style={styles.daysStripWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysStrip}
        >
          {DAYS_OF_WEEK.map((d) => {
            const isActive = selectedDay === d.id;
            return (
              <Pressable
                key={d.id}
                style={[styles.dayChip, isActive && styles.dayChipActive]}
                onPress={() => setSelectedDay(d.id)}
              >
                <Text style={[styles.dayText, isActive && styles.dayTextActive]}>
                  {lang === 'uk' ? d.uk : d.en}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {MEAL_SLOTS.map((slot, index) => {
          const currentChoiceId = getChoice(selectedDay, selectedProfile, slot.slotId);
          // Find index of chosen meal to pass to carousel
          const chosenIndex = currentChoiceId ? slot.options.findIndex(o => o.id === currentChoiceId) : -1;

          return (
            <View key={slot.slotId}>
              <MealCarouselRow
                day={selectedDay}
                slot={slot}
                isKids={false}
                selectedIndex={chosenIndex}
                onSelectIndex={(idx) => handleSelectIndex(slot.slotId, idx)}
                lang={lang}
              />
              {index < MEAL_SLOTS.length - 1 && (
                <View style={styles.mealRowDivider}>
                  <View style={styles.mealRowDividerLine} />
                  <View style={[styles.mealRowDividerLine, { width: 4, height: 4 }]} />
                  <View style={styles.mealRowDividerLine} />
                </View>
              )}
            </View>
          );
        })}

        {/* Read-only summary for all members */}
        <View style={styles.summaryWrapper}>
          <Text style={styles.summaryTitle}>{summaryTitle}</Text>
          <View style={styles.summaryContent}>
            {PROFILES.map(profile => {
              const choicesForDay = getChoicesForDay(selectedDay)[profile] || {};
              const choicesText = MEAL_SLOTS.map(slot => {
                const mealId = choicesForDay[slot.slotId];
                const meal = mealId ? slot.options.find(o => o.id === mealId) : null;
                return meal ? mealTitle(meal) : '—';
              }).join(' • ');

              return (
                <Text key={profile} style={styles.summaryLine}>
                  <Text style={styles.summaryProfileName}>{profileLabel(profile, lang)}:</Text> {choicesText}
                </Text>
              );
            })}
          </View>
        </View>

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
  profilesWrapper: {
    flexGrow: 0,
    marginTop: 12,
  },
  profilesScroll: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  profileChip: {
    paddingHorizontal: 16,
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
  profileChipActive: {
    backgroundColor: '#FF7A45',
    borderColor: '#FF7A45',
  },
  profileChipLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#666',
  },
  profileChipLabelActive: {
    color: '#FFFFFF',
  },
  daysStripWrapper: {
    flexGrow: 0,
    marginTop: 4,
  },
  daysStrip: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginRight: 8,
  },
  dayChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  dayText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: '#666',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  mealRowDivider: {
    width: '100%',
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transform: [{ translateY: -12 }],
  },
  mealRowDividerLine: {
    width: '33%',
    height: 2,
    borderRadius: 999,
    backgroundColor: '#FF7A45',
  },
  summaryWrapper: {
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  summaryTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  summaryContent: {
    gap: 8,
  },
  summaryLine: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  summaryProfileName: {
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
  },
});
