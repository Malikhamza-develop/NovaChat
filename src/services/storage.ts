import { ConversationSummary, Message, User } from '../types';

const USER_KEY = 'novachat_user';
const REGISTERED_USERS_KEY = 'novachat_registered_users';
const CONVERSATIONS_KEY = 'novachat_conversations';
const MESSAGES_KEY = 'novachat_messages';
const THEME_KEY = 'novachat_theme';
const ONBOARDING_KEY = 'novachat_onboarding_completed';

export const defaultCurrentUser: User = {
  _id: 'user_current',
  name: 'Alex Vance',
  email: 'alex.vance@novachat.app',
  phoneNumber: '+1 (555) 019-2834',
  simCarrier: 'Verizon Wireless',
  simSlot: 'SIM 1',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  statusBio: 'Building the future of peer-to-peer & mesh communication 🚀',
  verified: true,
  wifiDirectName: 'Alex-Galaxy-S24',
  wifiDirectEnabled: true,
};

export const sampleConversations: ConversationSummary[] = [
  {
    userId: 'nova-ai',
    name: 'Nova AI Assistant',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    phoneNumber: '+1 (800) NOVA-AI',
    simCarrier: 'Cloud AI Engine',
    lastMessage: 'Hello! I am Nova AI ✨. Ask me anything, summarize chats, or draft responses!',
    lastAt: new Date().toISOString(),
    unreadCount: 0,
    online: true,
    typing: false,
    muted: false,
    pinned: true,
    archived: false,
    verified: true,
    status: 'read',
    preferredChannel: 'cloud',
    wifiDirectStatus: 'disconnected',
    wifiDirectSignal: 0,
    isAi: true,
  },
];

export const sampleMessages: Record<string, Message[]> = {
  'nova-ai': [
    {
      _id: 'ai-welcome-msg',
      from: 'nova-ai',
      to: 'user_current',
      content: "Hello! 👋 I am **Nova AI Assistant** ✨, powered by Google Gemini.\n\nI can help you with:\n- 💬 **Conversations**: Ask questions, brainstorm ideas, write code & creative content\n- 📝 **Summaries**: Summarize long chat threads into actionable bullet points\n- ✍️ **Tone Polish**: Rephrase drafts to sound professional, friendly, or persuasive\n- 🌐 **Translation**: Translate messages seamlessly across languages\n\nHow can I assist you today?",
      status: 'read',
      createdAt: new Date().toISOString(),
      type: 'text',
      channel: 'cloud',
    },
  ],
};

export const getStoredUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveStoredUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  saveRegisteredUser(user);
};

export const getStoredRegisteredUsers = (): User[] => {
  const data = localStorage.getItem(REGISTERED_USERS_KEY);
  if (!data) {
    const initialUsers = [defaultCurrentUser];
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  return JSON.parse(data);
};

export const saveRegisteredUser = (user: User): User[] => {
  const users = getStoredRegisteredUsers();
  const existingIdx = users.findIndex(
    (u) =>
      (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
      u._id === user._id
  );
  let updatedUsers: User[];
  if (existingIdx >= 0) {
    updatedUsers = [...users];
    updatedUsers[existingIdx] = { ...updatedUsers[existingIdx], ...user };
  } else {
    updatedUsers = [...users, user];
  }
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
  return updatedUsers;
};

export const getStoredConversations = (): ConversationSummary[] => {
  const data = localStorage.getItem(CONVERSATIONS_KEY);
  if (!data) {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(sampleConversations));
    return sampleConversations;
  }
  try {
    const conversations: ConversationSummary[] = JSON.parse(data);
    const filtered = conversations.filter((c) => !c.userId.startsWith('demo-'));
    if (filtered.length !== conversations.length) {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return sampleConversations;
  }
};

export const saveStoredConversations = (conversations: ConversationSummary[]) => {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
};

export const getStoredMessages = (): Record<string, Message[]> => {
  const data = localStorage.getItem(MESSAGES_KEY);
  if (!data) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(sampleMessages));
    return sampleMessages;
  }
  try {
    const messagesMap: Record<string, Message[]> = JSON.parse(data);
    const filtered: Record<string, Message[]> = {};
    Object.keys(messagesMap).forEach((key) => {
      if (!key.startsWith('demo-')) {
        filtered[key] = messagesMap[key];
      }
    });
    if (Object.keys(filtered).length !== Object.keys(messagesMap).length) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return sampleMessages;
  }
};

export const saveStoredMessages = (messages: Record<string, Message[]>) => {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
};

export const getStoredTheme = (): 'light' | 'dark' => {
  const theme = localStorage.getItem(THEME_KEY);
  if (theme === 'dark' || theme === 'light') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const saveStoredTheme = (theme: 'light' | 'dark') => {
  localStorage.setItem(THEME_KEY, theme);
};

export const getStoredOnboarding = (): boolean => {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
};

export const saveStoredOnboarding = (completed: boolean) => {
  localStorage.setItem(ONBOARDING_KEY, completed ? 'true' : 'false');
};
