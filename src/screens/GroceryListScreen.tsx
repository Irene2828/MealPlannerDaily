import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGrocery } from '../context/GroceryContext';

export default function GroceryListScreen() {
  const { groceryList, removeFromGrocery } = useGrocery();
  
  const items = Array.from(groceryList);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Grocery List</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Your list is empty</Text>
            <Text style={styles.emptySubText}>Add ingredients from your meals!</Text>
          </View>
        ) : (
          items.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Pressable 
                style={styles.checkbox} 
                onPress={() => removeFromGrocery(item)}
              >
                <View style={styles.checkboxInner} />
              </Pressable>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))
        )}
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
    fontSize: 32,
    color: '#1A1A1A',
    lineHeight: 40,
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    // When checked, we just remove it from the list entirely
    // But if we wanted a visual state before removing, we'd do it here
  },
  listText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
});
