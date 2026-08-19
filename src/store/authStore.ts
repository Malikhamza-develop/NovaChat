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

import {
  initializeFCM,
  setupFCMTokenRefresh,
  setupFCMForegroundListener,
  removeFCMToken,
} from '../services/fcmService';

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
  fcmUnsubscribers: (() => void)[];

  loadAuth: () => Promise<void>;
  finishOnboarding: () => Promise<void>;
  login: (data: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const startFCM = async (set: (partial: Partial<AuthState>) => void) => {
  try {
    await initializeFCM();

    const unsubscribeRefresh = setupFCMTokenRefresh();
    const unsubscribeForeground = setupFCMForegroundListener();

    set({
      fcmUnsubscribers: [unsubscribeRefresh, unsubscribeForeground],
    });
  } catch (error) {
    console.log('FCM init error:', error);
  }
};

const stopFCM = async (unsubscribers: (() => void)[]) => {
  try {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
    await removeFCMToken();
  } catch (error) {
    console.log('FCM teardown error:', error);
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  loading: true,
  hasSeenOnboarding: false,
  fcmUnsubscribers: [],

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

        await startFCM(set);

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

    await startFCM(set);
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
    await stopFCM(get().fcmUnsubscribers);

    disconnectSocket();

    await storage.removeItem('token');
    await storage.removeItem('user');

    disconnectSocket();
    require('./chatStore').useChatStore.getState().resetOnLogout();

    set({
      token: null,
      user: null,
      loading: false,
      fcmUnsubscribers: [],
    });

    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }
  },
}));
