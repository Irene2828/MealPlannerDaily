import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MEAL_SLOTS, MealSlot, MealOption } from '../data/meals';
import { KIDS_MEAL_SLOTS } from '../data/kidsMeals';

interface GroceryContextType {
  groceryList: Set<string>;
  inventoryList: Set<string>;
  confirmedMeals: Set<string>;
  adultsMeals: MealSlot[];
  kidsMeals: MealSlot[];
  addToGrocery: (item: string) => void;
  removeFromGrocery: (item: string) => void;
  toggleInventory: (item: string) => void;
  toggleConfirmMeal: (mealId: string) => void;
  updateGroceryItem: (oldItem: string, newItem: string) => void;
  addCustomMeals: (slotId: string, newOptions: MealOption[]) => void;
  removeMealOption: (slotId: string, mealId: string, isKids: boolean) => void;
  updateMealImage: (slotId: string, mealId: string, isKids: boolean, imageUrl: string) => void;
}

const GroceryContext = createContext<GroceryContextType | undefined>(undefined);

export const GroceryProvider = ({ children }: { children: ReactNode }) => {
  const [groceryList, setGroceryList] = useState<Set<string>>(new Set());
  const [inventoryList, setInventoryList] = useState<Set<string>>(new Set());
  const [confirmedMeals, setConfirmedMeals] = useState<Set<string>>(new Set());
  const [adultsMeals, setAdultsMeals] = useState<MealSlot[]>(MEAL_SLOTS);
  const [kidsMeals, setKidsMeals] = useState<MealSlot[]>(KIDS_MEAL_SLOTS);

  const addToGrocery = (item: string) => {
    setGroceryList((prev) => {
      const next = new Set(prev);
      next.add(item);
      return next;
    });
    // If added to grocery, it's definitely not in inventory
    setInventoryList((prev) => {
      if (prev.has(item)) {
        const next = new Set(prev);
        next.delete(item);
        return next;
      }
      return prev;
    });
  };

  const removeFromGrocery = (item: string) => {
    setGroceryList((prev) => {
      const next = new Set(prev);
      next.delete(item);
      return next;
    });
  };

  const toggleInventory = (item: string) => {
    setInventoryList((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
        // If marked as have, remove from grocery list if it was there
        removeFromGrocery(item);
      }
      return next;
    });
  };

  const toggleConfirmMeal = (mealId: string) => {
    setConfirmedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(mealId)) {
        next.delete(mealId);
      } else {
        next.add(mealId);
      }
      return next;
    });
  };

  const updateGroceryItem = (oldItem: string, newItem: string) => {
    if (!newItem.trim()) {
      removeFromGrocery(oldItem);
      return;
    }
    setGroceryList((prev) => {
      const next = new Set<string>();
      // To preserve ordering as much as possible, we rebuild the set
      prev.forEach((val) => {
        if (val === oldItem) {
          next.add(newItem);
        } else {
          next.add(val);
        }
      });
      return next;
    });
  };

  const addCustomMeals = (slotId: string, newOptions: MealOption[]) => {
    setAdultsMeals((prev) => {
      return prev.map((slot) => {
        // If they add 'snack', we add to both morning-snack and afternoon-snack
        if (slotId === 'snack') {
          if (slot.slotId === 'morning-snack' || slot.slotId === 'afternoon-snack') {
            return {
              ...slot,
              options: [...slot.options, ...newOptions],
            };
          }
        } else if (slot.slotId === slotId) {
          return {
            ...slot,
            options: [...slot.options, ...newOptions],
          };
        }
        return slot;
      });
    });
  };


  const removeMealOption = (slotId: string, mealId: string, isKids: boolean) => {
    const setter = isKids ? setKidsMeals : setAdultsMeals;
    setter((prev) => {
      return prev.map((slot) => {
        if (slot.slotId === slotId) {
          return {
            ...slot,
            options: slot.options.filter((opt) => opt.id !== mealId),
          };
        }
        return slot;
      });
    });
  };

  const updateMealImage = (slotId: string, mealId: string, isKids: boolean, imageUrl: string) => {
    const setter = isKids ? setKidsMeals : setAdultsMeals;
    setter((prev) => {
      return prev.map((slot) => {
        if (slot.slotId === slotId) {
          return {
            ...slot,
            options: slot.options.map((opt) => 
              opt.id === mealId ? { ...opt, imageUrl } : opt
            ),
          };
        }
        return slot;
      });
    });
  };

  return (
    <GroceryContext.Provider
      value={{
        groceryList,
        inventoryList,
        confirmedMeals,
        adultsMeals,
        kidsMeals,
        addToGrocery,
        removeFromGrocery,
        toggleInventory,
        toggleConfirmMeal,
        updateGroceryItem,
        addCustomMeals,
        removeMealOption,
        updateMealImage,
      }}
    >
      {children}
    </GroceryContext.Provider>
  );
};

export const useGrocery = () => {
  const context = useContext(GroceryContext);
  if (context === undefined) {
    throw new Error('useGrocery must be used within a GroceryProvider');
  }
  return context;
};
