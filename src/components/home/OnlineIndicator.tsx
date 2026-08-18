import React from 'react';
import { StyleSheet, View } from 'react-native';

import colors from '../../theme/colors';

type Props = {
  online?: boolean;
  size?: number;
};

const OnlineIndicator = ({
  online = false,
  size = 14,
}: Props) => {
  if (!online) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            width: size - 4,
            height: size - 4,
            borderRadius: (size - 4) / 2,
          },
        ]}
      />
    </View>
  );
};

export default React.memo(OnlineIndicator);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  dot: {
    backgroundColor: '#22C55E',
  },
});