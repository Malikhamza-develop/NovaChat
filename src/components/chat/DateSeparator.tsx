import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

export const DateSeparator: React.FC<{ date: string }> = ({ date }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{date}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  label: {
    backgroundColor: '#E2E8F0',
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
