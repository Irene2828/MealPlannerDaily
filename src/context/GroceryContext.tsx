import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GroceryContextType {
  groceryList: Set<string>;
  inventoryList: Set<string>;
  addToGrocery: (item: string) => void;
  removeFromGrocery: (item: string) => void;
  toggleInventory: (item: string) => void;
}

const GroceryContext = createContext<GroceryContextType | undefined>(undefined);

export const GroceryProvider = ({ children }: { children: ReactNode }) => {
  const [groceryList, setGroceryList] = useState<Set<string>>(new Set());
  const [inventoryList, setInventoryList] = useState<Set<string>>(new Set());

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

  return (
    <GroceryContext.Provider
      value={{
        groceryList,
        inventoryList,
        addToGrocery,
        removeFromGrocery,
        toggleInventory,
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
