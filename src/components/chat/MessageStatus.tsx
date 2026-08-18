import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react-native';
import { MessageStatus as StatusType } from '../../types';

interface MessageStatusProps {
  status: StatusType | string;
}

export const MessageStatus: React.FC<MessageStatusProps> = ({ status }) => {
  switch (status) {
    case 'sending':
    case 'pending':
      return <ActivityIndicator size={12} color="#94A3B8" style={styles.icon} />;
    case 'failed':
      return <AlertCircle size={14} color="#F43F5E" style={styles.icon} />;
    case 'sent':
      return <Check size={14} color="#CBD5E1" style={styles.icon} />;
    case 'delivered':
      return <CheckCheck size={14} color="#CBD5E1" style={styles.icon} />;
    case 'read':
      return <CheckCheck size={14} color="#38BDF8" style={styles.icon} />;
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  icon: {
    marginLeft: 4,
  },
});
