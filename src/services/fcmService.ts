import messaging from "@react-native-firebase/messaging";
import api from "./api/axios";

const registerTokenWithBackend = async (token: string) => {
  try {
    await api.post("/fcm/token", { token });

    console.log("[FCM] Token registered with backend");
  } catch (error) {
    console.error("[FCM] Failed to register token:", error);
  }
};

export const requestNotificationPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log("[FCM] Notification permission:", enabled);

    return enabled;
  } catch (error) {
    console.error("[FCM] Permission request failed:", error);
    return false;
  }
};

export const initializeFCM = async () => {
  try {
    const permissionGranted = await requestNotificationPermission();

    if (!permissionGranted) {
      console.log("[FCM] Notification permission not granted");
      return null;
    }

    const token = await messaging().getToken();

    if (!token) {
      console.warn("[FCM] No FCM token received");
      return null;
    }

    console.log("[FCM] Device token received");

    await registerTokenWithBackend(token);

    return token;
  } catch (error) {
    console.error("[FCM] Initialization failed:", error);
    return null;
  }
};

export const setupFCMTokenRefresh = () => {
  return messaging().onTokenRefresh(async (token) => {
    console.log("[FCM] Token refreshed");

    await registerTokenWithBackend(token);
  });
};

export const setupFCMForegroundListener = () => {
  return messaging().onMessage(async (remoteMessage) => {
    console.log("[FCM] Foreground message:", remoteMessage);
  });
};

export const removeFCMToken = async () => {
  try {
    const token = await messaging().getToken();

    if (token) {
      await api.delete("/fcm/token", {
        data: { token },
      });
    }

    await messaging().deleteToken();

    console.log("[FCM] Token removed");
  } catch (error) {
    console.error("[FCM] Failed to remove token:", error);
  }
};
