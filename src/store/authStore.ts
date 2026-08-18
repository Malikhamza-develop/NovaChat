import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  initializeSocket,
  disconnectSocket,
} from '../services/socket/socket';

import { navigationRef } from '../navigation/navigationRef';

import {
  getCurrentUser,
  updateCurrentUser,
} from '../services/api/userApi';

import {
  User,
  AuthResponse,
} from '../types/Auth';

const ONBOARDING_STORAGE_KEY = 'has_seen_onboarding';

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.log(`Storage getItem error (${key}):`, error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.log(`Storage setItem error (${key}):`, error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.log(`Storage removeItem error (${key}):`, error);
    }
  },
};

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  hasSeenOnboarding: boolean;

  loadAuth: () => Promise<void>;
  finishOnboarding: () => Promise<void>;
  login: (data: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  loading: true,
  hasSeenOnboarding: false,

  loadAuth: async () => {
    try {
      const token = await storage.getItem('token');
      const user = await storage.getItem('user');
      const onboarding = await storage.getItem(
        ONBOARDING_STORAGE_KEY
      );

      if (token && user) {
        const storedUser = JSON.parse(user) as User;

        set({
          token,
          user: storedUser,
          loading: false,
          hasSeenOnboarding: onboarding === 'true',
        });

        try {
          initializeSocket(token);
        } catch (error) {
          console.log('Socket init error:', error);
        }

        try {
          const currentUser = await getCurrentUser();

          await storage.setItem(
            'user',
            JSON.stringify(currentUser)
          );

          set({
            user: currentUser,
          });
        } catch (error) {
          console.log(
            'Profile refresh error:',
            error
          );
        }
      } else {
        set({
          token: null,
          user: null,
          loading: false,
          hasSeenOnboarding: onboarding === 'true',
        });
      }
    } catch (error) {
      console.log('Auth restore error:', error);

      set({
        token: null,
        user: null,
        loading: false,
      });
    }
  },

  login: async (data) => {
    if (!data?.token || !data?.user) {
      throw new Error(
        'Invalid login response from server'
      );
    }

    await storage.setItem(
      'token',
      data.token
    );

    await storage.setItem(
      'user',
      JSON.stringify(data.user)
    );

    set({
      token: data.token,
      user: data.user,
      loading: false,
    });

    try {
      initializeSocket(data.token);
    } catch (error) {
      console.log(
        'Socket init error:',
        error
      );
    }
  },

  finishOnboarding: async () => {
    await storage.setItem(
      ONBOARDING_STORAGE_KEY,
      'true'
    );

    set({
      hasSeenOnboarding: true,
    });
  },

  updateProfile: async (updates) => {
    const currentUser =
      useAuthStore.getState().user;

    if (!currentUser) {
      return;
    }

    const nextUser =
      await updateCurrentUser({
        name:
          updates.name ??
          currentUser.name,

        avatar:
          updates.avatar ??
          currentUser.avatar,
      });

    await storage.setItem(
      'user',
      JSON.stringify(nextUser)
    );

    set({
      user: nextUser,
    });
  },

  logout: async () => {
    await storage.removeItem('token');
    await storage.removeItem('user');

    disconnectSocket();
    require('./chatStore').useChatStore.getState().resetOnLogout();

    set({
      token: null,
      user: null,
      loading: false,
    });

    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }
  },
}));
