import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import colors from '../../theme/colors';

const Dot: React.FC<{ delay: number }> = ({ delay }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(scale, {
          toValue: 1.4,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(800 - delay),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [delay, scale]);

  return (
    <Animated.View
      style={[styles.dot, { transform: [{ scale }] }]}
    />
  );
};

export const TypingIndicator: React.FC<{ name?: string }> = ({ name }) => {
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.label}>
          {name ? `${name} is typing` : 'Typing'}
        </Text>
        <View style={styles.dotsRow}>
          <Dot delay={0} />
          <Dot delay={200} />
          <Dot delay={400} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginRight: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginHorizontal: 2,
  },
});
