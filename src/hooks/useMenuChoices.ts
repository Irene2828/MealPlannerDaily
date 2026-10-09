import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

export type Profile = 'Мама' | 'Тато' | 'Марчик';
export const PROFILES: Profile[] = ['Мама', 'Тато', 'Марчик'];

type MenuChoices = {
  [day: string]: {
    [profile: string]: {
      [slotId: string]: string | null;
    }
  }
};

const STORAGE_KEY = 'family-menu-choices-v1';

export const useMenuChoices = () => {
  const [choices, setChoices] = useState<MenuChoices>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setChoices(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load menu choices from localStorage', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveChoices = useCallback((newChoices: MenuChoices) => {
    setChoices(newChoices);
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newChoices));
      } catch (e) {
        console.error('Failed to save menu choices to localStorage', e);
      }
    }
  }, []);

  const setChoice = useCallback((day: string, profile: Profile, slotId: string, mealId: string | null) => {
    setChoices(prev => {
      const next = { ...prev };
      if (!next[day]) next[day] = {};
      if (!next[day][profile]) next[day][profile] = {};

      const newDayProfile = { ...next[day][profile], [slotId]: mealId };
      next[day] = { ...next[day], [profile]: newDayProfile };

      if (Platform.OS === 'web') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to save menu choices to localStorage', e);
        }
      }
      return next;
    });
  }, []);

  const getChoice = useCallback((day: string, profile: Profile, slotId: string): string | null => {
    return choices[day]?.[profile]?.[slotId] || null;
  }, [choices]);

  const getChoicesForDay = useCallback((day: string) => {
    return choices[day] || {};
  }, [choices]);

  return {
    choices,
    isLoaded,
    setChoice,
    getChoice,
    getChoicesForDay,
  };
};
