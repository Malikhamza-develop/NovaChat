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
  Call: {
    receiverId: string;
    receiverName: string;
    receiverAvatar?: string;
    callType: 'audio' | 'video';
    channel?: 'cloud' | 'wifi_direct' | 'sim_sms';
    isIncoming?: boolean;
  };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};
