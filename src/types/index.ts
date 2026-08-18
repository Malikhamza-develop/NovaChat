export type MessageStatus =
  | 'sending'
  | 'pending'
  | 'failed'
  | 'sent'
  | 'delivered'
  | 'read';

export type MessageType = 'text' | 'image' | 'audio' | 'system';

export type MessageChannel = 'cloud' | 'wifi_direct' | 'sim_sms';

export interface Reaction {
  user: string; // User ID or 'me'
  emoji: string;
}

export interface Message {
  _id: string;
  clientId?: string;
  from: string;
  to: string;
  content: string;
  status: MessageStatus | string;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
  type?: MessageType;
  channel?: MessageChannel;
  mediaUrl?: string | null;
  audioUrl?: string | null;
  audioDuration?: number;
  replyTo?: string | null;
  replyToMessage?: Message | null;
  reactions?: Reaction[];
  deletedAt?: string | null;
  deletedBy?: string | null;
  isAi?: boolean;
}

export interface ConversationSummary {
  userId: string;
  name: string;
  avatar?: string;
  phoneNumber?: string;
  simCarrier?: string;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
  online?: boolean;
  typing?: boolean;
  muted?: boolean;
  pinned?: boolean;
  archived?: boolean;
  verified?: boolean;
  lastSeen?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  preferredChannel?: MessageChannel;
  wifiDirectStatus?: 'disconnected' | 'connecting' | 'connected';
  wifiDirectSignal?: number; // 0 to 100
  isAi?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  simCarrier?: string;
  simSlot?: 'SIM 1' | 'SIM 2';
  avatar?: string;
  statusBio?: string;
  verified?: boolean;
  wifiDirectName?: string;
  wifiDirectEnabled?: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';
