import { Linking, Alert, Platform } from 'react-native';
import { MessageChannel } from '../types/Message';

export const channelLabel = (channel: MessageChannel) => {
  switch (channel) {
    case 'wifi_direct':
      return 'Wi-Fi Direct P2P';
    case 'sim_sms':
      return 'SIM Cellular SMS';
    default:
      return 'NovaChat Cloud';
  }
};

export const validateChannelSend = (params: {
  channel: MessageChannel;
  wifiDirectConnected?: boolean;
}): boolean => {
  if (params.channel === 'wifi_direct' && !params.wifiDirectConnected) {
    Alert.alert(
      'Wi-Fi Direct',
      'Connect to this contact via Wi-Fi Direct first. Tap "Pair" in the chat header banner.',
    );
    return false;
  }
  return true;
};

export const dispatchSimSms = async (phoneNumber: string | undefined, body: string) => {
  if (!phoneNumber) {
    Alert.alert(
      'SIM SMS',
      'No phone number on file for this contact. Message was sent via NovaChat Cloud.',
    );
    return;
  }

  const url = Platform.select({
    ios: `sms:${phoneNumber}&body=${encodeURIComponent(body)}`,
    default: `sms:${phoneNumber}?body=${encodeURIComponent(body)}`,
  });

  try {
    const supported = await Linking.canOpenURL(url!);
    if (supported) {
      await Linking.openURL(url!);
    }
  } catch {
    Alert.alert('SIM SMS', 'Could not open the SMS app on this device.');
  }
};
