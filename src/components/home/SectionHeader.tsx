import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import colors from '../../theme/colors';

type Props = {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
};

const SectionHeader = ({
  title,
  actionText,
  onActionPress,
}: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title}
      </Text>

      {actionText ? (
        <Pressable
          onPress={onActionPress}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionText}>
            {actionText}
          </Text>
        </Pressable>
      ) : (
        <View />
      )}
    </View>
  );
};

export default React.memo(SectionHeader);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginHorizontal: 20,
    marginBottom: 14,
    marginTop: 6,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },

  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  actionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.7,
  },
});