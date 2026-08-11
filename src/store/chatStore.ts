import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as chatApi from '../services/api/chatApi';
import { Message, ConversationSummary } from '../types/Message';
import { useAuthStore } from './authStore';
import { getSocket, sendMessage, reactToMessage, deleteMessageSocket } from '../services/socket/socket';

const SYNC_STORAGE_KEY = 'chat_last_synced_at';
const CHAT_CONVERSATIONS_KEY = 'chat_conversations';
const CHAT_MESSAGES_KEY = 'chat_messages';

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
    await AsyncStorage.setItem(CHAT_CONVERSATIONS_KEY, JSON.stringify(conversations));
    await AsyncStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  } catch (error) {
    console.log('Persist chat state error:', error);
  }
};

const loadStoredChatState = async () => {
  try {
    const [rawConversations, rawMessages] = await Promise.all([
      AsyncStorage.getItem(CHAT_CONVERSATIONS_KEY),
      AsyncStorage.getItem(CHAT_MESSAGES_KEY),
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

interface ChatState {
  conversations: ConversationSummary[];
  messages: Record<string, Message[]>;
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
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  lastSyncedAt: null,
  loading: false,

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
        since = (await AsyncStorage.getItem(SYNC_STORAGE_KEY)) || null;
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
      await AsyncStorage.setItem(SYNC_STORAGE_KEY, now);
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
          messages.map((message) =>
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

    Object.values(get().messages).flat().forEach((message) => {
      if (message.from === currentUserId && message.status === 'sending') {
        sendMessage(message.to, message.content, message.clientId);
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
          messages.map((message) => {
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
      sendMessage(messageToRetry.to, messageToRetry.content, messageToRetry.clientId);
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
    get().updateMessageReaction(message);
  },

  toggleReaction: (messageId, emoji) => {
    reactToMessage(messageId, emoji);
  },

  deleteMessage: (messageId) => {
    deleteMessageSocket(messageId);
  },

  setUserPresence: (userId, online, lastSeen) =>
    set((state) => ({
      conversations: state.conversations.map((item) =>
        item.userId === userId
          ? { ...item, online, lastSeen: online ? undefined : lastSeen ?? item.lastSeen }
          : item,
      ),
    })),

  setTyping: (userId, typing) =>
    set((state) => ({
      conversations: state.conversations.map((item) =>
        item.userId === userId ? { ...item, typing } : item,
      ),
    })),

  markConversationRead: (userId) =>
    set((state) => {
      const currentUserId = useAuthStore.getState().user?._id;
      const messages = state.messages[userId] ?? [];
      const nextMessages = {
        ...state.messages,
        [userId]: messages.map((message) =>
          message.to === currentUserId && message.status !== 'read'
            ? { ...message, status: 'read', readAt: new Date().toISOString() }
            : message,
        ),
      };
      const conversations = state.conversations.map((item) =>
        item.userId === userId ? { ...item, unreadCount: 0 } : item,
      );
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
