import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import fonts from '../../theme/fonts';

const Input = ({ style, ...props }: TextInputProps) => {
  return <TextInput placeholderTextColor={colors.placeholder} style={[styles.input, style]} {...props} />;
};

export default Input;

const styles = StyleSheet.create({
  input: {
    height: 55,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    fontSize: fonts.size.md,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
});
