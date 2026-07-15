import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MealPlannerScreen from './MealPlannerScreen';
import GroceryListScreen from './GroceryListScreen';
import SettingsScreen from './SettingsScreen';
import { useGrocery } from '../context/GroceryContext';

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState<'home' | 'grocery' | 'settings'>('home');
  const insets = useSafeAreaInsets();
  const { groceryList } = useGrocery();

  return (
    <LinearGradient 
      colors={['#FFEAD9', '#FFFFFF', '#FFFFFF', '#FFFFFF']} 
      locations={[0, 0.25, 0.75, 1]}
      style={styles.container}
    >
      {/* Unified Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable 
          style={styles.headerIconLeft} 
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons 
            name="settings-outline"
            size={25} 
            color={activeTab === 'settings' ? '#374151' : '#9CA3AF'} 
          />
        </Pressable>

        <Pressable 
          style={styles.headerTitleContainer} 
          onPress={() => setActiveTab('home')}
        >
          <Text style={styles.headerTitle}>Today's Menu</Text>
          <View style={styles.underlineContainer}>
            <View style={[styles.underlineSegment, { transform: [{ rotate: '-2deg' }], opacity: 0.9 }]} />
            <View style={[styles.underlineSegment, { transform: [{ rotate: '-0.5deg' }], marginTop: -1, opacity: 0.8, width: '90%', alignSelf: 'center' }]} />
          </View>
        </Pressable>

        <Pressable 
          style={styles.headerIconRight} 
          onPress={() => setActiveTab('grocery')}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name="list-outline"
              size={28} 
              color={activeTab === 'grocery' ? '#374151' : '#9CA3AF'} 
            />
            {groceryList.size > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{groceryList.size}</Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {activeTab === 'home' && <MealPlannerScreen />}
        {activeTab === 'grocery' && <GroceryListScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
    position: 'relative',
  },
  headerIconLeft: {
    position: 'absolute',
    left: 24,
    bottom: 4,
    padding: 8,
  },
  headerIconRight: {
    position: 'absolute',
    right: 24,
    bottom: 2,
    padding: 8,
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
});

