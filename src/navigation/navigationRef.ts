import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export const navigateToCall = (params: {
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  callType: 'audio' | 'video';
  channel?: string;
  isIncoming?: boolean;
}) => {
  if (!navigationRef.isReady()) return;

  navigationRef.navigate('Main', {
    screen: 'Call',
    params,
  });
};
