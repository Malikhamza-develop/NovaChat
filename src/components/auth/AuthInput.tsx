import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import fonts from '../../theme/fonts';

interface Props extends TextInputProps {
  value: string;
  placeholder: string;
}
 
const AuthInput = ({ value, placeholder, style, ...props }: Props) => {
  return (
    <TextInput
      value={value}
      placeholder={placeholder}
      placeholderTextColor={colors.placeholder}
      style={[styles.input, style]}
      {...props}
    />
  );
};

export default AuthInput;

const styles = StyleSheet.create({
  input: {
    height: 56,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    fontSize: fonts.size.md,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
