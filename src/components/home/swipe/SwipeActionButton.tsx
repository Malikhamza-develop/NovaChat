import React, { memo } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  ViewStyle,
} from 'react-native';

interface SwipeActionButtonProps {
  label: string;
  icon: React.ReactNode;
  backgroundColor: string;
  onPress: () => void;
  width?: number;
}

const SwipeActionButton = ({
  label,
  icon,
  backgroundColor,
  onPress,
  width = 80,
}: SwipeActionButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          width,
          backgroundColor,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      {icon}

      <Text style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
};

export default memo(SwipeActionButton);


const styles = StyleSheet.create({
  container: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },

  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});