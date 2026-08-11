import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/Home/HomeScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ArchivedChatsScreen from '../screens/Archive/ArchivedChatsScreen';
import NewChatScreen from '../screens/NewChat/NewChatScreen';
import UserProfileScreen from '../screens/Profile/UserProfileScreen';

import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => {
  return (
    <Stack.Navigator id="MainStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
      />

      <Stack.Screen
        name="Chat"
        component={ChatScreen}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      />

      <Stack.Screen
  name="ArchivedChats"
  component={ArchivedChatsScreen}
/>

      <Stack.Screen name="NewChat" component={NewChatScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
