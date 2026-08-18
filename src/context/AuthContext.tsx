import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import {
  getStoredUser,
  saveStoredUser,
  getStoredRegisteredUsers,
  saveRegisteredUser,
  getStoredTheme,
  saveStoredTheme,
  getStoredOnboarding,
  saveStoredOnboarding,
} from '../services/storage';
import { registerUser, loginUser } from '../services/api/authApi';

interface AuthContextType {
  user: User | null;
  registeredUsers: User[];
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  onboardingCompleted: boolean;
  showAuthModal: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string, name?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  toggleTheme: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(getStoredRegisteredUsers());
  const [theme, setTheme] = useState<'light' | 'dark'>(getStoredTheme());
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(getStoredOnboarding());
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveStoredTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const completeOnboarding = () => {
    setOnboardingCompleted(true);
    saveStoredOnboarding(true);
  };

  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  const login = async (email: string, password?: string, name?: string) => {
    const userName = name || email.split('@')[0] || 'User';
    const pwd = password || 'Password123!';
    let dbUser: User | null = null;

    try {
      // Try login first
      let res: any = null;
      try {
        res = await loginUser({ email, password: pwd });
      } catch {
        // If login fails, try register
        res = await registerUser({ name: userName, email, password: pwd });
      }

      if (res?.user) {
        dbUser = {
          _id: res.user._id,
          name: res.user.name,
          email: res.user.email,
          avatar: res.user.avatar || '',
          statusBio: 'Hey there! I am using NovaChat.',
          verified: true,
          phoneNumber: '+1 (555) ' + Math.floor(1000000 + Math.random() * 9000000).toString().slice(0, 7),
          simCarrier: 'Cellular Network',
          simSlot: 'SIM 1',
          wifiDirectName: (res.user.name || 'User').replace(/\s+/g, '-') + '-Device',
          wifiDirectEnabled: true,
        };
      }
    } catch (err) {
      console.warn('MongoDB API sync notice, proceeding with client session:', err);
    }

    if (!dbUser) {
      const existingList = getStoredRegisteredUsers();
      const existing = existingList.find(
        (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
      );

      if (existing) {
        dbUser = { ...existing };
        if (name) dbUser.name = name;
      } else {
        dbUser = {
          _id: 'user_' + Date.now(),
          name: userName,
          email,
          avatar: '',
          statusBio: 'Hey there! I am using NovaChat.',
          verified: true,
          phoneNumber: '+1 (555) ' + Math.floor(1000000 + Math.random() * 9000000).toString().slice(0, 7),
          simCarrier: 'Cellular Network',
          simSlot: 'SIM 1',
          wifiDirectName: userName.replace(/\s+/g, '-') + '-Device',
          wifiDirectEnabled: true,
        };
      }
    }

    setUser(dbUser);
    saveStoredUser(dbUser);
    const updatedUsers = saveRegisteredUser(dbUser);
    setRegisteredUsers(updatedUsers);
    setShowAuthModal(false);
  };

  const register = async (name: string, email: string, password?: string) => {
    let dbUser: User | null = null;
    const pwd = password || 'Password123!';

    try {
      const res = await registerUser({ name, email, password: pwd });
      if (res?.user) {
        dbUser = {
          _id: res.user._id,
          name: res.user.name,
          email: res.user.email,
          avatar: res.user.avatar || '',
          statusBio: 'Hey there! I am using NovaChat.',
          verified: true,
          phoneNumber: '+1 (555) ' + Math.floor(1000000 + Math.random() * 9000000).toString().slice(0, 7),
          simCarrier: 'Cellular Network',
          simSlot: 'SIM 1',
          wifiDirectName: name.replace(/\s+/g, '-') + '-Device',
          wifiDirectEnabled: true,
        };
      }
    } catch (err) {
      console.warn('MongoDB Register fallback to local:', err);
    }

    if (!dbUser) {
      dbUser = {
        _id: 'user_' + Date.now(),
        name,
        email,
        avatar: '',
        statusBio: 'Hey there! I am using NovaChat.',
        verified: true,
        phoneNumber: '+1 (555) ' + Math.floor(1000000 + Math.random() * 9000000).toString().slice(0, 7),
        simCarrier: 'Cellular Network',
        simSlot: 'SIM 1',
        wifiDirectName: name.replace(/\s+/g, '-') + '-Device',
        wifiDirectEnabled: true,
      };
    }

    setUser(dbUser);
    saveStoredUser(dbUser);
    const updatedUsers = saveRegisteredUser(dbUser);
    setRegisteredUsers(updatedUsers);
    setShowAuthModal(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('novachat_user');
    localStorage.removeItem('token');
    setShowAuthModal(true);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    saveStoredUser(updated);
    const updatedUsers = saveRegisteredUser(updated);
    setRegisteredUsers(updatedUsers);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        registeredUsers,
        isAuthenticated: !!user,
        theme,
        onboardingCompleted,
        showAuthModal,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        updateUser,
        toggleTheme,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
