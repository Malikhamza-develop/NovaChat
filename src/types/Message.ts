export type MessageStatus =
  | 'sending'
  | 'pending'
  | 'failed'
  | 'sent'
  | 'delivered'
  | 'read';

export type MessageType = 'text' | 'image' | 'audio' | 'system';

export interface Reaction {
  user: string;
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

  status?:
    | 'sending'
    | 'sent'
    | 'delivered'
    | 'read';

}
