export type MoodTag = 'cozy' | 'energized' | 'light' | 'indulgent' | 'quick';

export interface MealOption {
  id: string;
  title: string;
  emoji: string;
  imageUrl: string;
  // Keep optional fields in case they are needed for layout, though we won't use them visibly on cards
  moodTag?: MoodTag;
  moodLabel?: string;
  accentColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  nutrition?: {
    protein: number;
    fats: number;
    carbs: number;
    calories: number;
  };
  shoppingList?: string[];
  instructions?: string[];
}

export interface MealSlot {
  slotId: string;
  slotLabel: string;
  slotEmoji: string;
  options: MealOption[];
}

export const MEAL_SLOTS: MealSlot[] = [
  {
    slotId: 'breakfast',
    slotLabel: 'Сніданок',
    slotEmoji: '🧇',
    options: [
      {
        id: 'waffles-maple',
        title: 'Вафлі з кленовим сиропом',
        emoji: '🧇',
        imageUrl: '/meals/waffles-maple.jpg'
      }
    ],
  },
  {
    slotId: 'lunch',
    slotLabel: 'Обід',
    slotEmoji: '🌮',
    options: [
      {
        id: 'tacos-beef',
        title: 'Такос з фаршем',
        emoji: '🌮',
        imageUrl: '/meals/tacos-beef.jpg'
      }
    ],
  },
  {
    slotId: 'dinner',
    slotLabel: 'Вечеря',
    slotEmoji: '🍝',
    options: [
      {
        id: 'pasta-pesto',
        title: 'Макарони з зеленим песто',
        emoji: '🍝',
        imageUrl: '/meals/pasta-pesto.jpg'
      }
    ],
  },
];
