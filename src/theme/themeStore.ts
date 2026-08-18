import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import lightColors from './colors';
import darkColors from './darkColors';

const THEME_STORAGE_KEY = 'theme_mode';

const storage = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, val: string) => {
    try {
      await AsyncStorage.setItem(key, val);
    } catch {
      // ignore storage errors
    }
  },
};

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  colors: typeof lightColors;
  loading: boolean;
  loadTheme: () => Promise<void>;
  toggleTheme: () => Promise<void>;
  setTheme: (mode: ThemeMode) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  colors: lightColors,
  loading: true,

  loadTheme: async () => {
    try {
      const stored = await storage.getItem(THEME_STORAGE_KEY);
      const systemMode = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
      const mode: ThemeMode = stored === 'dark' || stored === 'light' ? stored : systemMode;
      set({ mode, colors: mode === 'dark' ? darkColors : lightColors, loading: false });
    } catch (error) {
      console.log('Load theme error:', error);
      set({ loading: false });
    }
  },

  toggleTheme: async () => {
    const next = get().mode === 'dark' ? 'light' : 'dark';
    await get().setTheme(next);
  },

  setTheme: async (mode: ThemeMode) => {
    try {
      await storage.setItem(THEME_STORAGE_KEY, mode);
      set({ mode, colors: mode === 'dark' ? darkColors : lightColors });
    } catch (error) {
      console.log('Set theme error:', error);
    }
  },
}));
