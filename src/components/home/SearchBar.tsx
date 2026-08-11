import React from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import Icon from 'react-native-vector-icons/Ionicons';

import colors from '../../theme/colors';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
};

const SearchBar = ({
  value,
  onChangeText,
  onFilterPress,
}: Props) => {

  const focused = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(
          focused.value ? 1.02 : 1,
          {
            duration: 180,
          },
        ),
      },
    ],

    shadowOpacity: withTiming(
      focused.value ? 0.18 : 0.08,
      {
        duration: 180,
      },
    ),

    shadowRadius: withTiming(
      focused.value ? 14 : 8,
      {
        duration: 180,
      },
    ),
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
      ]}
    >
      <View style={styles.searchContainer}>
        <Icon
          name="search-outline"
          size={22}
          color={colors.textSecondary}
          style={styles.icon}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search conversations..."
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          onFocus={() => {
            focused.value = true;
          }}
          onBlur={() => {
            focused.value = false;
          }}
        />

        {value.length > 0 && (
          <Pressable
            onPress={() => onChangeText('')}
            style={styles.clearButton}
          >
            <Icon
              name="close-circle"
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.filterButton,
          pressed && styles.pressed,
        ]}
        onPress={onFilterPress}
      >
        <Icon
          name="options-outline"
          size={22}
          color={colors.text}
        />
      </Pressable>
    </Animated.View>
  );
};

export default React.memo(SearchBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 4,
  },

  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',

    height: 56,

    backgroundColor: colors.surface,

    borderRadius: 18,

    paddingHorizontal: 16,

    borderWidth: 1,
    borderColor: colors.border,
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 0,
  },

  clearButton: {
    paddingLeft: 10,
  },

  filterButton: {
    width: 56,
    height: 56,

    marginLeft: 12,

    borderRadius: 18,

    backgroundColor: colors.surface,

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: colors.border,
  },

  pressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },
});