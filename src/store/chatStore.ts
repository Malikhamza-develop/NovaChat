import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as chatApi from '../services/api/chatApi';
import { Message, ConversationSummary, MessageChannel } from '../types/Message';
import { useAuthStore } from './authStore';
import { getSocket, sendMessage, reactToMessage, deleteMessageSocket } from '../services/socket/socket';

const SYNC_STORAGE_KEY = 'chat_last_synced_at';
const CHAT_CONVERSATIONS_KEY = 'chat_conversations';
const CHAT_MESSAGES_KEY = 'chat_messages';

const memoryStore: Record<string, string> = {};

const storage = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return memoryStore[key] || null;
    }
  },
  setItem: async (key: string, val: string) => {
    try {
      await AsyncStorage.setItem(key, val);
    } catch {
      memoryStore[key] = val;
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      delete memoryStore[key];
    }
  },
};

const mergeMessages = (existing: Message[], incoming: Message[]) => {
  const messageMap = new Map<string, Message>();
  existing.forEach((message) => messageMap.set(message._id, message));
  incoming.forEach((message) => messageMap.set(message._id, message));
  return Array.from(messageMap.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

const persistChatState = async (conversations: ConversationSummary[], messages: Record<string, Message[]>) => {
  try {
    await storage.setItem(CHAT_CONVERSATIONS_KEY, JSON.stringify(conversations));
    await storage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  } catch (error) {
    console.log('Persist chat state error:', error);
  }
};

const loadStoredChatState = async () => {
  try {
    const [rawConversations, rawMessages] = await Promise.all([
      storage.getItem(CHAT_CONVERSATIONS_KEY),
      storage.getItem(CHAT_MESSAGES_KEY),
    ]);

    return {
      conversations: rawConversations ? JSON.parse(rawConversations) as ConversationSummary[] : [],
      messages: rawMessages ? JSON.parse(rawMessages) as Record<string, Message[]> : {},
    };
  } catch (error) {
    console.log('Load stored chat error:', error);
    return {
      conversations: [],
      messages: {},
    };
  }
};

const getOtherUserId = (message: Message, currentUserId: string) =>
  message.from === currentUserId ? message.to : message.from;

export const EMPTY_MESSAGES: Message[] = [];

interface ChatState {
  conversations: ConversationSummary[];
  messages: Record<string, Message[]>;
  selectedChannel: MessageChannel;
  wifiDirectPeers: Array<{
    deviceId: string;
    deviceName: string;
    associatedUserId?: string;
    status: 'available' | 'connecting' | 'connected';
    signal: number;
  }>;
  setSelectedChannel: (channel: MessageChannel) => void;
  connectWifiDirectPeer: (userId: string) => void;
  disconnectWifiDirectPeer: (userId: string) => void;
  lastSyncedAt: string | null;
  loading: boolean;
  loadConversations: () => Promise<void>;
  loadConversation: (userId: string) => Promise<void>;
  syncMessages: () => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  setConversationMessages: (userId: string, messages: Message[]) => void;
  createConversation: (conversation: ConversationSummary) => void;
  seedTestConversations: () => void;
  archiveConversation: (userId: string) => Promise<void>;
pinConversation: (userId: string) => Promise<void>;
  deleteConversation: (userId: string) => void;
unarchiveConversation: (userId:string)=>Promise<void>;
  setUserPresence: (userId: string, online: boolean, lastSeen?: string) => void;
  setTyping: (userId: string, typing: boolean) => void;
  markConversationRead: (userId: string) => void;
  markMessageFailed: (clientId?: string) => void;
  retryPendingMessages: () => void;
  retryMessage: (clientId?: string) => void;
  updateMessageReaction: (message: Message) => void;
  handleDeletedMessage: (message: Message) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
  deleteMessage: (messageId: string) => void;
  activeConversationId: string | null;
  setActiveConversation: (userId: string | null) => void;
  resetOnLogout: () => void;
  toggleMuteConversation: (userId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  selectedChannel: 'cloud',
  wifiDirectPeers: [],
  lastSyncedAt: null,
  loading: false,
  activeConversationId: null,

  setActiveConversation: (userId) => set({ activeConversationId: userId }),

  resetOnLogout: () => {
    set({
      conversations: [],
      messages: {},
      activeConversationId: null,
      loading: false,
      lastSyncedAt: null,
      selectedChannel: 'cloud',
      wifiDirectPeers: [],
    });
    void storage.removeItem(CHAT_CONVERSATIONS_KEY);
    void storage.removeItem(CHAT_MESSAGES_KEY);
    void storage.removeItem(SYNC_STORAGE_KEY);
  },

  toggleMuteConversation: (userId) =>
    set((state) => ({
      conversations: state.conversations.map((item) =>
        item.userId === userId ? { ...item, muted: !item.muted } : item,
      ),
    })),

  setSelectedChannel: (channel) => {
    set({ selectedChannel: channel });

    const activeUserId = useAuthStore.getState().user?._id;
    if (!activeUserId) return;
  },

  connectWifiDirectPeer: (userId) => {
    const signal = Math.floor(Math.random() * 20) + 80;

    set((state) => ({
      wifiDirectPeers: state.wifiDirectPeers.map((peer) =>
        peer.associatedUserId === userId
          ? {
              ...peer,
              status: 'connected',
              signal,
            }
          : peer
      ),
      conversations: state.conversations.map((conversation) =>
        conversation.userId === userId
          ? {
              ...conversation,
              wifiDirectStatus: 'connected',
              wifiDirectSignal: signal,
              preferredChannel: 'wifi_direct',
            }
          : conversation
      ),
      selectedChannel: 'wifi_direct',
    }));
  },

  disconnectWifiDirectPeer: (userId) => {
    set((state) => ({
      wifiDirectPeers: state.wifiDirectPeers.map((peer) =>
        peer.associatedUserId === userId
          ? {
              ...peer,
              status: 'available',
              signal: 0,
            }
          : peer
      ),
      conversations: state.conversations.map((conversation) =>
        conversation.userId === userId
          ? {
              ...conversation,
              wifiDirectStatus: 'disconnected',
              wifiDirectSignal: 0,
              preferredChannel: 'cloud',
            }
          : conversation
      ),
      selectedChannel: 'cloud',
    }));
  },

  setConversationMessages: (userId, messages) =>
    set((state) => {
      const nextMessages = {
        ...state.messages,
        [userId]: mergeMessages(state.messages[userId] ?? [], messages),
      };
      void persistChatState(state.conversations, nextMessages);
      return { messages: nextMessages };
    }),

  addMessage: (message) => {
    const currentUserId = useAuthStore.getState().user?._id;
    if (!currentUserId) return;

    const otherUserId = getOtherUserId(message, currentUserId);
    set((state) => {
      const existingMessages = state.messages[otherUserId] ?? [];
      const nextMessages = {
        ...state.messages,
        [otherUserId]: mergeMessages(existingMessages, [message]),
      };

      const existingConversation = state.conversations.find((item) => item.userId === otherUserId);
      const conversationName = existingConversation?.name || otherUserId;
      const nextConversation: ConversationSummary = {
        userId: otherUserId,
        name: conversationName,
        avatar: existingConversation?.avatar,
        lastMessage: message.content,
        lastAt: message.createdAt,
        unreadCount: message.from === currentUserId ? existingConversation?.unreadCount ?? 0 : (existingConversation?.unreadCount ?? 0) + 1,
        preferredChannel: message.channel ?? existingConversation?.preferredChannel,
        archived: false,
      };
      const nextConversations = [
        nextConversation,
        ...state.conversations.filter((item) => item.userId !== otherUserId),
      ];

      void persistChatState(nextConversations, nextMessages);
      return { messages: nextMessages, conversations: nextConversations };
    });
  },

  updateMessage: (message) => {
    const currentUserId = useAuthStore.getState().user?._id;
    if (!currentUserId) return;

    const otherUserId = getOtherUserId(message, currentUserId);
    set((state) => {
      const existing = state.messages[otherUserId] ?? [];
      const updated = existing.map((item) => {
        if (item._id === message._id) return message;
        if (message.clientId && item.clientId === message.clientId) return message;
        return item;
      });
      const nextMessages = {
        ...state.messages,
        [otherUserId]: mergeMessages(updated, [message]),
      };
      void persistChatState(state.conversations, nextMessages);
      return { messages: nextMessages };
    });
  },

  loadConversations: async () => {
    set({ loading: true });
    try {
      const stored = await loadStoredChatState();
      if (stored.conversations.length || Object.keys(stored.messages).length) {
        set(stored);
      }

      const data = await chatApi.getConversations();
      set((state) => {
        const nextConversations = data.conversations.length ? data.conversations : state.conversations;
        void persistChatState(nextConversations, state.messages);
        return { conversations: nextConversations };
      });
    } catch (error) {
      console.log('Load conversations error:', error);
    } finally {
      set({ loading: false });
    }
  },

  loadConversation: async (userId) => {
    set({ loading: true });
    try {
      const data = await chatApi.getConversation(userId);
      set((state) => {
        const nextMessages = {
          ...state.messages,
          [userId]: mergeMessages(state.messages[userId] ?? [], data.messages),
        };
        void persistChatState(state.conversations, nextMessages);
        return { messages: nextMessages };
      });
    } catch (error) {
      console.log('Load conversation error:', error);
    } finally {
      set({ loading: false });
    }
  },

  syncMessages: async () => {
    const currentUserId = useAuthStore.getState().user?._id;
    if (!currentUserId) return;

    set({ loading: true });
    try {
      let since = get().lastSyncedAt;
      if (!since) {
        since = (await storage.getItem(SYNC_STORAGE_KEY)) || null;
      }

      const response = await chatApi.syncMessages(since || undefined);
      const grouped: Record<string, Message[]> = {};

      response.messages.forEach((message) => {
        const otherUserId = getOtherUserId(message, currentUserId);
        grouped[otherUserId] = grouped[otherUserId] ?? [];
        grouped[otherUserId].push(message);
      });

      set((state) => {
        const mergedMessages = { ...state.messages };
        Object.entries(grouped).forEach(([otherUserId, messages]) => {
          mergedMessages[otherUserId] = mergeMessages(mergedMessages[otherUserId] ?? [], messages);
        });
        void persistChatState(state.conversations, mergedMessages);
        return { messages: mergedMessages };
      });

      const now = new Date().toISOString();
      await storage.setItem(SYNC_STORAGE_KEY, now);
      set({ lastSyncedAt: now });
      await get().loadConversations();
    } catch (error) {
      console.log('Sync messages error:', error);
    } finally {
      set({ loading: false });
    }
  },

  createConversation: (conversation) =>
    set((state) => {
      const nextConversations = [conversation, ...state.conversations.filter((item) => item.userId !== conversation.userId)];
      void persistChatState(nextConversations, state.messages);
      return { conversations: nextConversations };
    }),

    archiveConversation: async (userId) => {
      try {
        await chatApi.updateConversationPreference(userId, { archived: true });
        set((state) => {

    const updated = state.conversations.map((item) =>
      item.userId === userId
        ? {
            ...item,
            archived: true,
          }
        : item
    );


    void persistChatState(
      updated,
      state.messages
    );


    return {
      conversations: updated,
    };

        });
      } catch (error) {
        console.log('Archive conversation error:', error);
      }
    },



pinConversation: async (userId) => {
  const conversation = get().conversations.find((item) => item.userId === userId);
  if (!conversation) return;

  try {
    await chatApi.updateConversationPreference(userId, { pinned: !conversation.pinned });
    set((state) => {

    const updated = state.conversations.map((item) =>
      item.userId === userId
        ? {
            ...item,
            pinned: !item.pinned,
          }
        : item
    );


    void persistChatState(
      updated,
      state.messages
    );


    return {
      conversations: updated,
    };

    });
  } catch (error) {
    console.log('Pin conversation error:', error);
  }
},



deleteConversation: (userId) =>
  set((state) => {

    const updatedConversations =
      state.conversations.filter(
        (item) =>
          item.userId !== userId
      );


    const updatedMessages = {
      ...state.messages,
    };


    delete updatedMessages[userId];


    void persistChatState(
      updatedConversations,
      updatedMessages
    );


    return {
      conversations: updatedConversations,
      messages: updatedMessages,
    };

  }),

  unarchiveConversation:async(userId)=>{
    try {
      await chatApi.updateConversationPreference(userId, { archived: false });
      set((state)=>{


const updated =
state.conversations.map(item=>

item.userId === userId

?

{
...item,
archived:false,
}

:

item

);



void persistChatState(
updated,
state.messages
);



return {
conversations:updated,
};


});
    } catch (error) {
      console.log('Unarchive conversation error:', error);
    }
  },

  markMessageFailed: (clientId) => {
    if (!clientId) return;
    set((state) => {
      const nextMessages = Object.fromEntries(
        Object.entries(state.messages).map(([userId, messages]) => [
          userId,
          (messages as Message[]).map((message: Message) =>
            message.clientId === clientId ? { ...message, status: 'failed' } : message,
          ),
        ]),
      );
      void persistChatState(state.conversations, nextMessages);
      return { messages: nextMessages };
    });
  },

  retryPendingMessages: () => {
    if (!getSocket()?.connected) return;
    const currentUserId = useAuthStore.getState().user?._id;
    if (!currentUserId) return;

    Object.values(get().messages).flat().forEach((m) => {
      const message = m as Message;
      if (message.from === currentUserId && message.status === 'sending') {
        sendMessage({
          toUserId: message.to,
          content: message.content,
          clientId: message.clientId,
          channel: message.channel ?? get().selectedChannel,
          type: (message.type === 'image' || message.type === 'audio' ? message.type : 'text'),
        });
      }
    });
  },

  retryMessage: (clientId) => {
    if (!clientId) return;

    let messageToRetry: Message | undefined;
    set((state) => {
      const nextMessages = Object.fromEntries(
        Object.entries(state.messages).map(([userId, messages]) => [
          userId,
          (messages as Message[]).map((message: Message) => {
            if (message.clientId === clientId && message.status === 'failed') {
              messageToRetry = { ...message, status: 'sending' };
              return messageToRetry;
            }
            return message;
          }),
        ]),
      );
      void persistChatState(state.conversations, nextMessages);
      return { messages: nextMessages };
    });

    if (messageToRetry && getSocket()?.connected) {
      sendMessage({
        toUserId: messageToRetry.to,
        content: messageToRetry.content,
        clientId: messageToRetry.clientId,
        channel: messageToRetry.channel ?? get().selectedChannel,
        type: (messageToRetry.type === 'image' || messageToRetry.type === 'audio'
          ? messageToRetry.type
          : 'text'),
      });
    }
  },

  updateMessageReaction: (message) => {
    const currentUserId = useAuthStore.getState().user?._id;
    if (!currentUserId) return;

    const otherUserId = getOtherUserId(message, currentUserId);
    set((state) => {
      const existing = state.messages[otherUserId] ?? [];
      const updated = existing.map((item) => {
        if (item._id === message._id) return message;
        if (message.clientId && item.clientId === message.clientId) return message;
        return item;
      });
      const nextMessages = {
        ...state.messages,
        [otherUserId]: mergeMessages(updated, [message]),
      };
      void persistChatState(state.conversations, nextMessages);
      return { messages: nextMessages };
    });
  },

  handleDeletedMessage: (message) => {
    get().updateMessage({
      ...message,
      content: message.content || 'This message was deleted',
    });
  },

  toggleReaction: (messageId, emoji) => {
    reactToMessage(messageId, emoji);
  },

  deleteMessage: (messageId) => {
    deleteMessageSocket(messageId);
  },

  setUserPresence: (userId, online, lastSeen) =>
    set((state) => {
      const conversation = state.conversations.find((item) => item.userId === userId);
      if (!conversation) return state;

      const nextLastSeen = online ? undefined : lastSeen ?? conversation.lastSeen;
      if (conversation.online === online && conversation.lastSeen === nextLastSeen) {
        return state;
      }

      return {
        conversations: state.conversations.map((item) =>
          item.userId === userId
            ? { ...item, online, lastSeen: nextLastSeen }
            : item,
        ),
      };
    }),

  setTyping: (userId, typing) =>
    set((state) => {
      const conversation = state.conversations.find((item) => item.userId === userId);
      if (!conversation || conversation.typing === typing) {
        return state;
      }

      return {
        conversations: state.conversations.map((item) =>
          item.userId === userId ? { ...item, typing } : item,
        ),
      };
    }),

  markConversationRead: (userId) =>
    set((state) => {
      const currentUserId = useAuthStore.getState().user?._id;
      const messages = state.messages[userId] ?? EMPTY_MESSAGES;

      let messagesChanged = false;
      const nextUserMessages = messages.map((message) => {
        if (message.to === currentUserId && message.status !== 'read') {
          messagesChanged = true;
          return { ...message, status: 'read', readAt: new Date().toISOString() };
        }
        return message;
      });

      const conversation = state.conversations.find((item) => item.userId === userId);
      const unreadNeedsReset = (conversation?.unreadCount ?? 0) > 0;

      if (!messagesChanged && !unreadNeedsReset) {
        return state;
      }

      const nextMessages = messagesChanged
        ? { ...state.messages, [userId]: nextUserMessages }
        : state.messages;

      const conversations = unreadNeedsReset
        ? state.conversations.map((item) =>
            item.userId === userId ? { ...item, unreadCount: 0 } : item,
          )
        : state.conversations;

      void persistChatState(conversations, nextMessages);
      return { conversations, messages: nextMessages };
    }),

    seedTestConversations: () => {
      set({
        conversations: [],
        messages: {},
      });
      void persistChatState([], {});
    }}));



