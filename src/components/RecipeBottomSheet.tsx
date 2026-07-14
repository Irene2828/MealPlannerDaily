import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { MealOption } from '../data/meals';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  option: MealOption | null;
  visible: boolean;
  onClose: () => void;
}

export const RecipeBottomSheet: React.FC<Props> = ({ option, visible, onClose }) => {
  const [shoppingOpen, setShoppingOpen] = useState(true);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const rotShop = useRef(new Animated.Value(1)).current;
  const rotInstr = useRef(new Animated.Value(0)).current;

  const toggleSection = (section: 'shopping' | 'instructions') => {
    if (section === 'shopping') {
      setShoppingOpen((v) => !v);
      Animated.timing(rotShop, {
        toValue: shoppingOpen ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      setInstructionsOpen((v) => !v);
      Animated.timing(rotInstr, {
        toValue: instructionsOpen ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const shopArrow = rotShop.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const instrArrow = rotInstr.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  if (!option) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill as any} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Pull handle */}
          <View style={styles.handle} />

          {/* Hero image */}
          <View style={styles.heroContainer}>
            <Image
              source={{ uri: option.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={[styles.heroOverlay, { backgroundColor: option.gradientFrom + 'BB' }]} />
            <View style={styles.heroContent}>
              <Text style={styles.heroEmoji}>{option.emoji}</Text>
              <Text style={styles.heroTitle}>{option.title}</Text>
              <View style={[styles.moodChip, { backgroundColor: option.accentColor + '33', borderColor: option.accentColor + '66' }]}>
                <Text style={[styles.moodChipText, { color: '#FFF' }]}>{option.moodLabel}</Text>
              </View>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Scrollable content */}
          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
            {/* Shopping list */}
            <Pressable style={styles.sectionHeader} onPress={() => toggleSection('shopping')}>
              <View style={styles.sectionHeaderLeft}>
                <Text style={styles.sectionIcon}>🛒</Text>
                <Text style={styles.sectionTitle}>Shopping List</Text>
              </View>
              <Animated.Text style={[styles.arrow, { transform: [{ rotate: shopArrow }] }]}>⌄</Animated.Text>
            </Pressable>
            {shoppingOpen && (
              <View style={styles.sectionBody}>
                {option.shoppingList.map((item, i) => (
                  <View key={i} style={styles.listItem}>
                    <View style={[styles.bullet, { backgroundColor: option.accentColor }]} />
                    <Text style={styles.listItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.divider} />

            {/* Instructions */}
            <Pressable style={styles.sectionHeader} onPress={() => toggleSection('instructions')}>
              <View style={styles.sectionHeaderLeft}>
                <Text style={styles.sectionIcon}>👨‍🍳</Text>
                <Text style={styles.sectionTitle}>Instructions</Text>
              </View>
              <Animated.Text style={[styles.arrow, { transform: [{ rotate: instrArrow }] }]}>⌄</Animated.Text>
            </Pressable>
            {instructionsOpen && (
              <View style={styles.sectionBody}>
                {option.instructions.map((step, i) => (
                  <View key={i} style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: option.accentColor }]}>
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.88,
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 0,
  },
  heroContainer: {
    height: 190,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    ...(StyleSheet.absoluteFill as any),
  },
  heroOverlay: {
    ...(StyleSheet.absoluteFill as any),
    opacity: 0.6,
  },
  heroContent: {
    position: 'absolute',
    bottom: 18,
    left: 20,
    right: 60,
  },
  heroEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  moodChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  moodChipText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  arrow: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
  },
  sectionBody: {
    paddingBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 1,
  },
  listItemText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 21,
    flex: 1,
  },
});
