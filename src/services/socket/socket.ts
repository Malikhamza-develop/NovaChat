import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from '../../config/environment';
import { MessageChannel } from '../../types/Message';
import { registerSocketListeners } from './socketListeners';

let socket: Socket | null = null;
let activeToken: string | null = null;
let cleanupListeners: (() => void) | null = null;

export const initializeSocket = (token: string) => {
  if (socket && activeToken === token) {
    return socket;
  }

  if (socket) {
    cleanupListeners?.();
    socket.disconnect();
    socket = null;
  }

  activeToken = token;

  socket = io(SERVER_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  const onConnect = () => console.log('Socket connected', socket?.id);
  const onDisconnect = (reason: string) => console.log('Socket disconnected', reason);
  const onConnectError = (error: Error) => console.log('Socket connect error', error.message);

  socket.on('connect', onConnect);
  socket.on('disconnect', onDisconnect);
  socket.on('connect_error', onConnectError);

  // registerSocketListeners offsets 'connect' before re-registering its own handler,
  // so call it AFTER adding diagnostic listeners — they get cleared then re-scoped cleanly.
  cleanupListeners = () => {
    socket?.off('connect', onConnect);
    socket?.off('disconnect', onDisconnect);
    socket?.off('connect_error', onConnectError);
    socketListenersCleanup?.();
  };

  const socketListenersCleanup = registerSocketListeners(socket);
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  cleanupListeners?.();
  cleanupListeners = null;
  if (!socket) return;
  socket.disconnect();
  socket = null;
  activeToken = null;
};

export interface SendMessageOptions {
  toUserId: string;
  content: string;
  clientId?: string;
  channel?: MessageChannel;
  type?: 'text' | 'image' | 'audio';
  mediaUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  replyTo?: string | null;
}

export const sendMessage = ({
  toUserId,
  content,
  clientId,
  channel = 'cloud',
  type = 'text',
  mediaUrl,
  audioUrl,
  audioDuration,
  replyTo,
}: SendMessageOptions) => {
  if (!socket?.connected) {
    console.log('Socket not connected — message queued for retry');
    return false;
  }

  socket.emit('sendMessage', {
    toUserId,
    message: content,
    clientId,
    channel,
    type,
    mediaUrl,
    audioUrl,
    audioDuration,
    replyTo,
  });
  return true;
};

export const markDelivered = (messageId: string) => {
  socket?.emit('messageDelivered', { messageId });
};

export const markRead = (messageId: string) => {
  socket?.emit('messageRead', { messageId });
};

export const reactToMessage = (messageId: string, emoji: string) => {
  socket?.emit('reactMessage', { messageId, emoji });
};

export const deleteMessageSocket = (messageId: string) => {
  socket?.emit('deleteMessage', { messageId });
};

export interface InviteCallOptions {
  toUserId: string;
  callType: 'audio' | 'video';
  channel?: MessageChannel;
  callerName: string;
  callerAvatar?: string;
}

export const inviteCall = ({
  toUserId,
  callType,
  channel = 'cloud',
  callerName,
  callerAvatar,
}: InviteCallOptions) => {
  socket?.emit('call:invite', {
    toUserId,
    callType,
    channel,
    callerName,
    callerAvatar,
  });
};

export const acceptCall = (toUserId: string) => {
  socket?.emit('call:accepted', { toUserId });
};

export const declineCall = (toUserId: string) => {
  socket?.emit('call:declined', { toUserId });
};

export const endCall = (toUserId: string) => {
  socket?.emit('call:ended', { toUserId });
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  sendMessage,
  markDelivered,
  markRead,
  reactToMessage,
  deleteMessageSocket,
  inviteCall,
  acceptCall,
  declineCall,
  endCall,
};
