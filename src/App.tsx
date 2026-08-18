import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import AppNavigator from './navigation/AppNavigator';
import { navigationRef } from './navigation/navigationRef';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './theme/themeStore';

enableScreens(false);

export default function App() {
  const loadAuth = useAuthStore((state) => state.loadAuth);
  const loadTheme = useThemeStore((state) => state.loadTheme);
  const mode = useThemeStore((state) => state.mode);
  const colors = useThemeStore((state) => state.colors);

  useEffect(() => {
    void loadAuth();
    void loadTheme();
  }, [loadAuth, loadTheme]);

  const navTheme = mode === 'dark'
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          primary: colors.primary,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          primary: colors.primary,
        },
      };

  return (
    <SafeAreaProvider style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <NavigationContainer ref={navigationRef} theme={navTheme}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
