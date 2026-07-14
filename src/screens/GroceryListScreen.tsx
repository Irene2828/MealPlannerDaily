import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGrocery } from '../context/GroceryContext';

const GroceryItemRow = ({ 
  item, 
  onRemove, 
  onUpdate 
}: { 
  item: string; 
  onRemove: () => void; 
  onUpdate: (newItem: string) => void; 
}) => {
  const [localValue, setLocalValue] = useState(item);

  useEffect(() => {
    setLocalValue(item);
  }, [item]);

  const handleBlur = () => {
    if (localValue !== item) {
      onUpdate(localValue);
    }
  };

  return (
    <View style={styles.listItem}>
      <Pressable 
        style={styles.checkbox} 
        onPress={onRemove}
      >
        <View style={styles.checkboxInner} />
      </Pressable>
      <TextInput
        style={styles.listInput}
        value={localValue}
        onChangeText={setLocalValue}
        onBlur={handleBlur}
        onSubmitEditing={handleBlur}
        returnKeyType="done"
      />
    </View>
  );
};

export default function GroceryListScreen() {
  const { groceryList, removeFromGrocery, updateGroceryItem } = useGrocery();
  
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
          <>
            {items.map((item) => (
              <GroceryItemRow
                key={item}
                item={item}
                onRemove={() => removeFromGrocery(item)}
                onUpdate={(newItem) => updateGroceryItem(item, newItem)}
              />
            ))}

            <Pressable 
              style={styles.smsButton}
              onPress={() => alert('Sending grocery list via SMS... (eventually)')}
            >
              <Ionicons name="phone-portrait-outline" size={16} color="#374151" style={{ marginRight: 8 }} />
              <Text style={styles.smsButtonText}>Send to My Phone</Text>
            </Pressable>
          </>
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
    fontSize: 20,
    color: '#1A1A1A',
    lineHeight: 26,
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
  listInput: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
    padding: 0,
  },
  smsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // White background fill
    borderWidth: 1,
    borderColor: '#374151', // Thin 1px charcoal border
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 24,
    alignSelf: 'center',
  },
  smsButtonText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#374151', // Charcoal text
  },
});
