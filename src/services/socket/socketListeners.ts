import type { Socket } from 'socket.io-client';
import type { Message } from '../../types/Message';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useCallStore } from '../../store/callStore';
import { markDelivered, markRead } from './socket';

const pendingAcks = new Map<string, ReturnType<typeof setTimeout>>();
const ACK_TIMEOUT_MS = 30000;

const normalizeMessage = (payload: Record<string, unknown>): Message => {
  return {
    _id: String(payload._id ?? ''),
    clientId: payload.clientId ? String(payload.clientId) : undefined,
    from: String(payload.from ?? ''),
    to: String(payload.to ?? ''),
    content: String(payload.content ?? ''),
    status: String(payload.status ?? 'sent'),
    createdAt: String(payload.createdAt ?? new Date().toISOString()),
    deliveredAt: payload.deliveredAt ? String(payload.deliveredAt) : undefined,
    readAt: payload.readAt ? String(payload.readAt) : undefined,
    type: (payload.type as Message['type']) ?? 'text',
    channel: (payload.channel as Message['channel']) ?? 'cloud',
    mediaUrl: payload.mediaUrl ? String(payload.mediaUrl) : null,
    audioUrl: payload.audioUrl ? String(payload.audioUrl) : null,
    audioDuration: typeof payload.audioDuration === 'number' ? payload.audioDuration : undefined,
    replyTo: payload.replyTo ? String(payload.replyTo) : null,
    reactions: Array.isArray(payload.reactions) ? (payload.reactions as Message['reactions']) : [],
    deletedAt: payload.deletedAt ? String(payload.deletedAt) : null,
    deletedBy: payload.deletedBy ? String(payload.deletedBy) : null,
  };
};

export const clearAckTimeout = (clientId?: string) => {
  if (!clientId) return;
  const timer = pendingAcks.get(clientId);
  if (timer) {
    clearTimeout(timer);
    pendingAcks.delete(clientId);
  }
};

export const trackAckTimeout = (clientId?: string) => {
  if (!clientId) return;
  clearAckTimeout(clientId);
  pendingAcks.set(
    clientId,
    setTimeout(() => {
      useChatStore.getState().markMessageFailed(clientId);
      pendingAcks.delete(clientId);
    }, ACK_TIMEOUT_MS),
  );
};

export const registerSocketListeners = (socket: Socket) => {
  const chat = () => useChatStore.getState();
  const calls = () => useCallStore.getState();

  socket.off('message');
  socket.off('message:sent');
  socket.off('message:delivered');
  socket.off('message:read');
  socket.off('message:reaction');
  socket.off('message:deleted');
  socket.off('typing');
  socket.off('userOnline');
  socket.off('userOffline');
  socket.off('onlineUsers');
  socket.off('call:invite');
  socket.off('call:accepted');
  socket.off('call:declined');
  socket.off('call:ended');
  socket.off('connect');

  socket.on('connect', () => {
    chat().retryPendingMessages();
    void chat().syncMessages();
  });

  socket.on('message', (payload: Record<string, unknown>) => {
    const message = normalizeMessage(payload);
    chat().addMessage(message);

    const authUserId = useAuthStore.getState().user?._id;
    if (!authUserId || message.to !== authUserId) return;

    const senderId = message.from;
    const isActiveChat = chat().activeConversationId === senderId;

    if (message._id && !message._id.startsWith('client_')) {
      markDelivered(message._id);
      if (isActiveChat) {
        markRead(message._id);
        chat().markConversationRead(senderId);
        socket.emit('conversationRead', { fromUserId: senderId });
      }
    }
  });

  socket.on('message:sent', (payload: Record<string, unknown>) => {
    const message = normalizeMessage(payload);
    clearAckTimeout(message.clientId);
    chat().updateMessage({ ...message, status: message.status || 'sent' });
  });

  socket.on('message:delivered', (payload: Record<string, unknown>) => {
    const message = normalizeMessage(payload);
    clearAckTimeout(message.clientId);
    chat().updateMessage({ ...message, status: 'delivered' });
  });

  socket.on('message:read', (payload: Record<string, unknown>) => {
    const message = normalizeMessage(payload);
    chat().updateMessage({ ...message, status: 'read' });
  });

  socket.on('message:reaction', (payload: Record<string, unknown>) => {
    chat().updateMessageReaction(normalizeMessage(payload));
  });

  socket.on('message:deleted', (payload: Record<string, unknown>) => {
    chat().handleDeletedMessage(normalizeMessage(payload));
  });

  socket.on('typing', ({ fromUserId, isTyping }: { fromUserId: string; isTyping: boolean }) => {
    chat().setTyping(fromUserId, isTyping);
  });

  socket.on('userOnline', ({ userId }: { userId: string }) => {
    chat().setUserPresence(userId, true);
  });

  socket.on('userOffline', ({ userId, lastSeen }: { userId: string; lastSeen?: string }) => {
    chat().setUserPresence(userId, false, lastSeen);
  });

  socket.on('onlineUsers', (userIds: string[]) => {
    const onlineSet = new Set(userIds);
    // Mark everyone in the snapshot as online
    userIds.forEach((userId) => chat().setUserPresence(userId, true));
    // Mark all conversations NOT in the snapshot as offline (ground-truth reset)
    chat().conversations.forEach((conv) => {
      if (!onlineSet.has(conv.userId)) {
        chat().setUserPresence(conv.userId, false);
      }
    });
  });

  socket.on(
    'call:invite',
    (payload: {
      fromUserId: string;
      callerName?: string;
      callerAvatar?: string;
      callType?: 'audio' | 'video';
      channel?: string;
    }) => {
      calls().receiveIncomingCall({
        remoteUserId: payload.fromUserId,
        remoteName: payload.callerName ?? 'Contact',
        remoteAvatar: payload.callerAvatar,
        callType: payload.callType ?? 'audio',
        channel: (payload.channel as Message['channel']) ?? 'cloud',
      });
    },
  );

  socket.on('call:accepted', ({ fromUserId }: { fromUserId: string }) => {
    const state = calls();
    if (state.remoteUserId === fromUserId && state.status === 'outgoing') {
      calls().markConnected();
    }
  });

  socket.on('call:declined', ({ fromUserId }: { fromUserId: string }) => {
    if (calls().remoteUserId === fromUserId) {
      calls().markDeclined();
    }
  });

  socket.on('call:ended', ({ fromUserId }: { fromUserId: string }) => {
    if (calls().remoteUserId === fromUserId) {
      calls().markEnded();
    }
  });

  return () => {
    socket.off('message');
    socket.off('message:sent');
    socket.off('message:delivered');
    socket.off('message:read');
    socket.off('message:reaction');
    socket.off('message:deleted');
    socket.off('typing');
    socket.off('userOnline');
    socket.off('userOffline');
    socket.off('onlineUsers');
    socket.off('call:invite');
    socket.off('call:accepted');
    socket.off('call:declined');
    socket.off('call:ended');
    socket.off('connect');
    pendingAcks.forEach((timer) => clearTimeout(timer));
    pendingAcks.clear();
  };
};
