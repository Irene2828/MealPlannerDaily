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
      colors={['#FFEAD9', '#FFFFFF', '#FFFFFF', '#FFEAD9']} 
      locations={[0, 0.25, 0.75, 1]}
      style={styles.container}
    >
      {/* Content Area */}
      <View style={styles.content}>
        {activeTab === 'home' && <MealPlannerScreen />}
        {activeTab === 'grocery' && <GroceryListScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Custom Bottom Tab Bar - Blending Gradient */}
      <LinearGradient 
        colors={['rgba(255,234,217,0)', 'rgba(255,234,217,0.85)', '#FFEAD9', '#FFEAD9']} 
        locations={[0, 0.4, 0.8, 1]}
        style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}
        pointerEvents="box-none"
      >
        <View style={styles.tabBarInner}>
          <Pressable 
            style={styles.tabItem} 
            onPress={() => setActiveTab('home')}
          >
            <Ionicons 
              name="restaurant-outline"
              size={24} 
              color={activeTab === 'home' ? '#374151' : '#9CA3AF'} 
            />
            <Text style={[styles.tabText, activeTab === 'home' && styles.tabTextActive]}>Menu</Text>
          </Pressable>

          <Pressable 
            style={styles.tabItem} 
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
            <Text style={[styles.tabText, activeTab === 'grocery' && styles.tabTextActive]}>Grocery List</Text>
          </Pressable>

          <Pressable 
            style={styles.tabItem} 
            onPress={() => setActiveTab('settings')}
          >
            <Ionicons 
              name="settings-outline"
              size={25} 
              color={activeTab === 'settings' ? '#374151' : '#9CA3AF'} 
            />
            <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>Settings</Text>
          </Pressable>
        </View>
      </LinearGradient>
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
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 32, // More top padding to allow the gradient to fade in slowly
  },
  tabBarInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
  tabText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#1A1A1A',
    fontFamily: 'DMSans_700Bold',
  },
});
