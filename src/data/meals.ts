export type MoodTag = 'cozy' | 'energized' | 'light' | 'indulgent' | 'quick';

export interface MealOption {
  id: string;
  title: string;
  titleEn?: string;
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
  slotLabelEn?: string;
  slotEmoji: string;
  options: MealOption[];
}

export const MEAL_SLOTS: MealSlot[] = [
  {
    slotId: 'breakfast',
    slotLabel: 'Сніданок',
    slotLabelEn: 'Breakfast',
    slotEmoji: '🧇',
    options: [
      {
        id: 'waffles-maple',
        title: 'Вафлі з кленовим сиропом',
        titleEn: 'Waffles with maple syrup',
        emoji: '🧇',
        imageUrl: '/meals/waffles-maple.jpg'
      },
      {
        id: 'toast-nutella',
        title: 'Тост з нутеллою',
        titleEn: 'Toast with Nutella',
        emoji: '🍞',
        imageUrl: '/meals/toast-nutella.jpg'
      },
      {
        id: 'english-muffin-sausage',
        title: 'Англійський мафін із сніданковою сосискою',
        titleEn: 'English muffin with breakfast sausage',
        emoji: '🥯',
        imageUrl: '/meals/english-muffin-sausage.jpg'
      }
    ],
  },
  {
    slotId: 'lunch',
    slotLabel: 'Обід',
    slotLabelEn: 'Lunch',
    slotEmoji: '🌮',
    options: [
      {
        id: 'tacos-beef',
        title: 'Такос з фаршем',
        titleEn: 'Beef tacos',
        emoji: '🌮',
        imageUrl: '/meals/tacos-beef.jpg'
      },
      {
        id: 'butter-chicken-rice',
        title: 'Батер чікен з рисом',
        titleEn: 'Butter chicken with rice',
        emoji: '🍛',
        imageUrl: '/meals/butter-chicken-rice.jpg'
      },
      {
        id: 'chicken-noodle-soup',
        title: 'Курячий суп з локшиною',
        titleEn: 'Chicken noodle soup',
        emoji: '🍜',
        imageUrl: '/meals/chicken-noodle-soup.jpg'
      }
    ],
  },
  {
    slotId: 'dinner',
    slotLabel: 'Вечеря',
    slotLabelEn: 'Dinner',
    slotEmoji: '🍝',
    options: [
      {
        id: 'pasta-pesto',
        title: 'Макарони з зеленим песто',
        titleEn: 'Pasta with green pesto',
        emoji: '🍝',
        imageUrl: '/meals/pasta-pesto.jpg'
      },
      {
        id: 'burrito-beef',
        title: 'Буріто з мʼясом',
        titleEn: 'Beef burrito',
        emoji: '🌯',
        imageUrl: '/meals/burrito-beef.jpg'
      },
      {
        id: 'veg-chili',
        title: 'Вегетаріанське чилі',
        titleEn: 'Vegetarian chili',
        emoji: '🍲',
        imageUrl: '/meals/veg-chili.jpg'
      }
    ],
  },
];
