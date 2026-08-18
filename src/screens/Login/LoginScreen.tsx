import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import {
  useForm,
  Controller,
} from 'react-hook-form';

import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  loginSchema,
  LoginFormData,
} from '../../validation/authSchemas';

import {
  loginUser,
} from '../../services/api/authApi';

import {
  useAuthStore,
} from '../../store/authStore';

import AuthInput from '../../components/auth/AuthInput';
import PasswordInput from '../../components/auth/PasswordInput';
import AuthButton from '../../components/auth/AuthButton';

import colors from '../../theme/colors';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  AuthStackParamList,
} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Login'
>;

const LoginScreen = ({ navigation }: Props) => {
  const [error, setError] = useState('');

  const login = useAuthStore(
    state => state.login
  );

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!data.email || !data.password) {
      return;
    }

    try {
      setError('');

      console.log('LOGIN: sending request');

      const response = await loginUser({
        email: data.email.trim(),
        password: data.password,
      });

      console.log(
        'LOGIN: API response received:',
        JSON.stringify(response, null, 2)
      );

      console.log(
        'LOGIN: token exists:',
        !!response?.token
      );

      console.log(
        'LOGIN: user exists:',
        !!response?.user
      );

      await login(response);

      console.log(
        'LOGIN: Zustand login completed'
      );

      console.log(
        'LOGIN: stored token:',
        !!useAuthStore.getState().token
      );

      console.log(
        'LOGIN: stored user:',
        useAuthStore.getState().user
      );

    } catch (error: any) {
      console.log(
        '========== LOGIN ERROR =========='
      );

      console.log(
        'ERROR:',
        error
      );

      console.log(
        'MESSAGE:',
        error?.message
      );

      console.log(
        'RESPONSE:',
        error?.response?.data
      );

      console.log(
        'STACK:',
        error?.stack
      );

      console.log(
        '================================='
      );

      setError(
        error?.response?.data?.message ??
        error?.message ??
        'Login failed. Please try again.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          Welcome Back
        </Text>

        <Text style={styles.subtitle}>
          Login to continue chatting
        </Text>

        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <>
              <AuthInput
                value={value}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
              />

              {errors.email && (
                <Text style={styles.fieldError}>
                  {errors.email.message}
                </Text>
              )}
            </>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <>
              <PasswordInput
                value={value}
                placeholder="Password"
                onChangeText={onChange}
              />

              {errors.password && (
                <Text style={styles.fieldError}>
                  {errors.password.message}
                </Text>
              )}
            </>
          )}
        />

        <AuthButton
          title="Login"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />

        <Text
          style={styles.register}
          onPress={() =>
            navigation.navigate('Register')
          }
        >
          Don't have an account? Register
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 25,
  },

  error: {
    color: colors.danger,
    marginBottom: 15,
    fontSize: 14,
  },

  fieldError: {
    color: colors.danger,
    fontSize: 13,
    marginTop: -10,
    marginBottom: 10,
  },

  register: {
    marginTop: 25,
    textAlign: 'center',
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
});
