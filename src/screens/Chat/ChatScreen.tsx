import React, {
  useEffect,
  useCallback,
  useState,
} from 'react';

import {
  KeyboardAvoidingView,
  Alert,
  Platform,
  StyleSheet,
  View,
  Text,
  Pressable,
  Share,
} from 'react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  MainStackParamList,
} from '../../navigation/types';

import {
  useAuthStore,
} from '../../store/authStore';

import {
  useChatStore,
  EMPTY_MESSAGES,
} from '../../store/chatStore';

import {
  getSocket,
  sendMessage,
} from '../../services/socket/socket';
import { trackAckTimeout } from '../../services/socket/socketListeners';
import type { Message } from '../../types/Message';
import { useCallStore } from '../../store/callStore';
import { validateChannelSend, dispatchSimSms } from '../../services/channelService';

import { ChatHeader } from '../../components/chat/ChatHeader';
import { MessageList } from '../../components/chat/MessageList';
import { MessageInput } from '../../components/chat/MessageInput';

import { confirmArchive } from '../../utils/confirmations';
import { useAppTheme } from '../../theme/useAppTheme';

type Props = NativeStackScreenProps<MainStackParamList, 'Chat'>;

const ChatScreen = ({ route, navigation }: Props) => {
  const { receiverId, receiverName } = route.params;

  const user = useAuthStore((state) => state.user);
  const userId = user?._id;

  const messages = useChatStore(
    (state) => state.messages[receiverId] ?? EMPTY_MESSAGES,
  );
  const conversation = useChatStore((state) =>
    state.conversations.find((item) => item.userId === receiverId),
  );
  const selectedChannel = useChatStore((state) => state.selectedChannel);
  const addMessage = useChatStore((state) => state.addMessage);
  const loadConversation = useChatStore((state) => state.loadConversation);
  const markConversationRead = useChatStore((state) => state.markConversationRead);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const retryMessage = useChatStore((state) => state.retryMessage);
  const toggleReaction = useChatStore((state) => state.toggleReaction);
  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const archiveConversation = useChatStore((state) => state.archiveConversation);
  const pinConversation = useChatStore((state) => state.pinConversation);
  const startOutgoingCall = useCallStore((state) => state.startOutgoingCall);

  const { colors } = useAppTheme();
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  useEffect(() => {
    setActiveConversation(receiverId);
    return () => setActiveConversation(null);
  }, [receiverId, setActiveConversation]);

  useEffect(() => {
    void (async () => {
      await loadConversation(receiverId);
      markConversationRead(receiverId);
      getSocket()?.emit('conversationRead', { fromUserId: receiverId });
    })();
  }, [receiverId, loadConversation, markConversationRead]);

  const handleSend = useCallback(
    (text: string) => {
      if (!userId || !receiverId) return;

      if (
        !validateChannelSend({
          channel: selectedChannel,
          wifiDirectConnected: conversation?.wifiDirectStatus === 'connected',
        })
      ) {
        return;
      }

      const clientId = `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const optimistic: Message = {
        _id: clientId,
        clientId,
        from: userId,
        to: receiverId,
        content: text,
        replyTo: replyTo?._id ?? null,
        status: 'sending',
        channel: selectedChannel,
        createdAt: new Date().toISOString(),
      };

      addMessage(optimistic);
      trackAckTimeout(clientId);

      const sent = sendMessage({
        toUserId: receiverId,
        content: text,
        clientId,
        channel: selectedChannel,
        replyTo: replyTo?._id ?? null,
      });

      if (!sent) {
        useChatStore.getState().markMessageFailed(clientId);
      }

      if (selectedChannel === 'sim_sms') {
        void dispatchSimSms(conversation?.phoneNumber, text);
      }

      setReplyTo(null);
    },
    [userId, receiverId, addMessage, replyTo, selectedChannel, conversation],
  );

  const handleStartCall = useCallback(
    (callType: 'audio' | 'video') => {
      if (!userId) return;

      startOutgoingCall({
        remoteUserId: receiverId,
        remoteName: receiverName,
        remoteAvatar: conversation?.avatar,
        callType,
        channel: selectedChannel,
        callerName: user?.name ?? 'NovaChat User',
        callerAvatar: user?.avatar,
      });

      navigation.navigate('Call', {
        receiverId,
        receiverName,
        receiverAvatar: conversation?.avatar,
        callType,
        channel: selectedChannel,
      });
    },
    [
      userId,
      user,
      receiverId,
      receiverName,
      conversation?.avatar,
      selectedChannel,
      startOutgoingCall,
      navigation,
    ],
  );

  const handleReact = useCallback(
    (messageId: string, emoji: string) => {
      toggleReaction(messageId, emoji);
    },
    [toggleReaction],
  );

  const handleReply = useCallback((message: Message) => {
    setReplyTo(message);
  }, []);

  const handleDelete = useCallback(
    (messageId: string) => {
      Alert.alert('Delete message', 'This message will be deleted for everyone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMessage(messageId) },
      ]);
    },
    [deleteMessage],
  );

  const handleCopy = useCallback(async (text: string) => {
    try {
      await Share.share({ message: text });
    } catch {
      Alert.alert('Message', text);
    }
  }, []);

  const handleTypingChange = useCallback(
    (isTyping: boolean) => {
      getSocket()?.emit('typing', { toUserId: receiverId, isTyping });
    },
    [receiverId],
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ChatHeader
        conversation={conversation}
        name={receiverName}
        image={conversation?.avatar}
        online={conversation?.online}
        typing={conversation?.typing}
        lastSeen={conversation?.lastSeen}
        onBack={() => navigation.goBack()}
        onProfilePress={() =>
          navigation.navigate('UserProfile', {
            userId: receiverId,
            name: receiverName,
            avatar: conversation?.avatar,
            online: conversation?.online,
            lastSeen: conversation?.lastSeen,
          })
        }
        onStartAudioCall={() => handleStartCall('audio')}
        onStartVideoCall={() => handleStartCall('video')}
        onTogglePin={() => void pinConversation(receiverId)}
        onToggleArchive={() =>
          confirmArchive(receiverName, () => {
            void archiveConversation(receiverId);
            navigation.goBack();
          })
        }
        onToggleMute={() => useChatStore.getState().toggleMuteConversation(receiverId)}
      />

      <View style={styles.messages}>
        <MessageList
          currentUserId={userId ?? ''}
          messages={messages}
          isTyping={conversation?.typing}
          contactName={receiverName}
          onRetryMessage={(message: Message) => retryMessage(message.clientId)}
          onReact={handleReact}
          onReply={handleReply}
          onDelete={handleDelete}
          onCopy={handleCopy}
        />
      </View>

      {replyTo ? (
        <View style={[styles.replyBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={[styles.replyBarContent, { borderLeftColor: colors.primary }]}>
            <Text style={[styles.replyLabel, { color: colors.primary }]}>Replying to</Text>
            <Text style={[styles.replyText, { color: colors.textSecondary }]} numberOfLines={1}>
              {replyTo.content}
            </Text>
          </View>
          <Pressable onPress={() => setReplyTo(null)} style={styles.replyClose}>
            <Text style={[styles.replyCloseText, { color: colors.textMuted }]}>✕</Text>
          </Pressable>
        </View>
      ) : null}

      <MessageInput onSend={handleSend} onTypingChange={handleTypingChange} />
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messages: {
    flex: 1,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  replyBarContent: {
    flex: 1,
    borderLeftWidth: 3,
    paddingLeft: 10,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 14,
  },
  replyClose: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  replyCloseText: {
    fontSize: 18,
  },
});
