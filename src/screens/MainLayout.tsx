import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MealPlannerScreen from './MealPlannerScreen';
import GroceryListScreen from './GroceryListScreen';
import { useGrocery } from '../context/GroceryContext';

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState<'home' | 'grocery'>('home');
  const insets = useSafeAreaInsets();
  const { groceryList } = useGrocery();

  return (
    <View style={styles.container}>
      {/* Content Area */}
      <View style={styles.content}>
        {activeTab === 'home' ? <MealPlannerScreen /> : <GroceryListScreen />}
      </View>

      {/* Custom Bottom Tab Bar */}
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable 
          style={styles.tabItem} 
          onPress={() => setActiveTab('home')}
        >
          <Ionicons 
            name={activeTab === 'home' ? 'restaurant' : 'restaurant-outline'} 
            size={24} 
            color={activeTab === 'home' ? '#1A1A1A' : '#9CA3AF'} 
          />
          <Text style={[styles.tabText, activeTab === 'home' && styles.tabTextActive]}>Menu</Text>
        </Pressable>

        <Pressable 
          style={styles.tabItem} 
          onPress={() => setActiveTab('grocery')}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name={activeTab === 'grocery' ? 'list' : 'list-outline'} 
              size={28} 
              color={activeTab === 'grocery' ? '#1A1A1A' : '#9CA3AF'} 
            />
            {groceryList.size > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{groceryList.size}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabText, activeTab === 'grocery' && styles.tabTextActive]}>Grocery List</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF8F0',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
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
