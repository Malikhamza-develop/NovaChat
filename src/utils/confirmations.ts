import { Alert } from 'react-native';

export const confirmArchive = (name: string, onConfirm: () => void) => {
  Alert.alert(
    'Archive chat',
    `Archive conversation with ${name}? You can restore it anytime from Archived chats.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Archive', style: 'destructive', onPress: onConfirm },
    ],
  );
};

export const confirmDelete = (name: string, onConfirm: () => void) => {
  Alert.alert(
    'Delete chat',
    `Delete conversation with ${name}? This removes it from this device.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ],
  );
};
