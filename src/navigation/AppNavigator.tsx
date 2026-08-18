import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  useAuthStore,
} from '../store/authStore';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';

import {
  RootStackParamList,
} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const token = useAuthStore((state) => state.token);
  const hasSeenOnboarding = useAuthStore((state) => state.hasSeenOnboarding);

  const initialRoute = token
    ? hasSeenOnboarding
      ? 'Main'
      : 'Onboarding'
    : 'Auth';

  return (
    <Stack.Navigator
      id="AppStack"
      key={`${token ? 'auth' : 'guest'}-${hasSeenOnboarding}`}
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;