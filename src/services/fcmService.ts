import {
  AuthorizationStatus,
  deleteToken,
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';

import api from './api/axios';

const messagingInstance = getMessaging();

const registerTokenWithBackend = async (token: string) => {
  try {
    await api.post('/fcm/token', {token});

    console.log('[FCM] Token registered with backend');
  } catch (error) {
    console.error('[FCM] Failed to register token:', error);
  }
};

export const requestNotificationPermission = async () => {
  try {
    const authStatus = await requestPermission(messagingInstance);

    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    console.log('[FCM] Notification permission:', enabled);

    return enabled;
  } catch (error) {
    console.error('[FCM] Permission request failed:', error);
    return false;
  }
};

export const initializeFCM = async () => {
  try {
    const permissionGranted = await requestNotificationPermission();

    if (!permissionGranted) {
      console.log('[FCM] Notification permission not granted');
      return null;
    }

    const token = await getToken(messagingInstance);

    if (!token) {
      console.warn('[FCM] No FCM token received');
      return null;
    }

    console.log('[FCM] Device token received');

    await registerTokenWithBackend(token);

    return token;
  } catch (error) {
    console.error('[FCM] Initialization failed:', error);
    return null;
  }
};

export const setupFCMTokenRefresh = () => {
  return onTokenRefresh(messagingInstance, async token => {
    console.log('[FCM] Token refreshed');

    await registerTokenWithBackend(token);
  });
};

export const setupFCMForegroundListener = () => {
  return onMessage(messagingInstance, async remoteMessage => {
    console.log('[FCM] Foreground message:', remoteMessage);
  });
};

export const removeFCMToken = async () => {
  try {
    const token = await getToken(messagingInstance);

    if (token) {
      await api.delete('/fcm/token', {
        data: {token},
      });
    }

    await deleteToken(messagingInstance);

    console.log('[FCM] Token removed');
  } catch (error) {
    console.error('[FCM] Failed to remove token:', error);
  }
};