import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MealPlannerScreen from './MealPlannerScreen';
import GroceryListScreen from './GroceryListScreen';
import { useGrocery } from '../context/GroceryContext';
import { useLanguage } from '../hooks/useLanguage';
import { useAutoUpdate } from '../hooks/useAutoUpdate';

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState<'home' | 'grocery'>('home');
  const insets = useSafeAreaInsets();
  const { groceryList } = useGrocery();
  const { lang, toggleLang } = useLanguage();
  const { updateAvailable, applyUpdate } = useAutoUpdate();
  /* Hide the app title when embedded as a widget (e.g. kids-routine tablet):
     the host already shows its own "Меню дня" header. */
  const [isEmbedded, setIsEmbedded] = useState(false);
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.self !== window.top) {
        setIsEmbedded(true);
      }
    } catch (e) {
      setIsEmbedded(true);
    }
  }, []);

  return (
    <LinearGradient
      colors={['#FFEAD9', '#FFFFFF', '#FFFFFF', '#FFFFFF']}
      locations={[0, 0.25, 0.75, 1]}
      style={styles.container}
    >
      {/* Unified Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerLeftContainer}>
          <Pressable style={styles.familyMascotButton} onPress={() => setActiveTab('home')}>
            <View style={styles.familyMascotCircle}>
              <MaterialCommunityIcons name="bird" size={23} color="rgba(255, 122, 69, 0.7)" />
            </View>
          </Pressable>
        </View>

        {!isEmbedded && (
          <Pressable
            style={styles.headerTitleContainer}
            onPress={() => setActiveTab('home')}
          >
            <Text style={styles.headerTitle}>{lang === 'uk' ? 'Меню на день' : "Today's Menu"}</Text>
            <View style={styles.underlineContainer}>
              <View style={[styles.underlineSegment, { transform: [{ rotate: '-2deg' }], opacity: 0.9 }]} />
              <View style={[styles.underlineSegment, { transform: [{ rotate: '-0.5deg' }], marginTop: -1, opacity: 0.8, width: '90%', alignSelf: 'center' }]} />
            </View>
          </Pressable>
        )}

        <View style={styles.headerRightContainer}>
          <Pressable style={styles.langToggle} onPress={toggleLang}>
            <Text style={styles.langToggleText}>{lang === 'uk' ? 'EN' : 'УКР'}</Text>
          </Pressable>
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {activeTab === 'home' && <MealPlannerScreen lang={lang} />}
        {activeTab === 'grocery' && <GroceryListScreen />}
      </View>

      {/* Update prompt: appears when a newer build was deployed */}
      {updateAvailable && (
        <Pressable style={styles.updatePill} onPress={applyUpdate}>
          <Text style={styles.updatePillText}>
            {lang === 'uk' ? 'Є оновлення • Оновити' : 'Update available • Refresh'}
          </Text>
        </Pressable>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
    position: 'relative',
  },
  headerLeftContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  familyMascotButton: {
    padding: 3,
  },
  familyMascotCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(255, 122, 69, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  langToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  langToggleText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#FF7A45',
  },
  headerIcon: {
    padding: 4,
  },
  headerTitleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  headerTitle: {
    fontFamily: 'Lora_500Medium',
    fontSize: 20,
    color: '#1A1A1A',
    lineHeight: 26,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  underlineContainer: {
    position: 'absolute',
    bottom: -4,
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
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'DMSans_700Bold',
  },
  updatePill: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  updatePillText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
