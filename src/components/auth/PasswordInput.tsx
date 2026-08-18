import React, { useState } from 'react';
import { TextInput, Pressable, View, StyleSheet, TextInputProps } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import fonts from '../../theme/fonts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props extends TextInputProps {
  value: string;
  placeholder: string;
}

const PasswordInput = ({ value, placeholder, onChangeText, autoCapitalize = 'none', style, ...props }: Props) => {
  const [secureText, setSecureText] = useState(true);

  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        onChangeText={onChangeText}
        secureTextEntry={secureText}
        autoCapitalize={autoCapitalize}
        style={styles.input}
        {...props}
      />
      <Pressable onPress={() => setSecureText(!secureText)} style={styles.icon}>
        <MaterialCommunityIcons
          name={secureText ? 'eye-off-outline' : 'eye-outline'}
          size={24}
          color={colors.textSecondary}
        />
      </Pressable>
    </View>
  );
};

export default PasswordInput;

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    height: '100%',
    paddingHorizontal: spacing.md,
    paddingRight: 52,
    fontSize: fonts.size.md,
    color: colors.text,
  },
  icon: {
    position: 'absolute',
    right: spacing.md,
    height: 56,
    justifyContent: 'center',
  },
});
