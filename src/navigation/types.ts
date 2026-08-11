export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Chat: {
    conversationId: string;
    receiverId: string;
    receiverName: string;
  };
  Profile: undefined;
  ArchivedChats: undefined;
  NewChat: undefined;
  UserProfile: {
    userId: string;
    name: string;
    avatar?: string;
    online?: boolean;
    lastSeen?: string;
  };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};
