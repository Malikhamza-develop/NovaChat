import api from './axios';
import { Message, ConversationSummary } from '../../types/Message';

export const getConversations = async () => {
  const response = await api.get<{ conversations: ConversationSummary[] }>('/messages/conversations');
  return response.data;
};

export const getConversation = async (userId: string, page = 1, limit = 50) => {
  const response = await api.get<{ messages: Message[]; page: number; limit: number; total: number }>(
    `/messages/conversation/${userId}?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const syncMessages = async (since?: string) => {
  const path = since ? `/messages/sync?since=${encodeURIComponent(since)}` : '/messages/sync';
  const response = await api.get<{ messages: Message[] }>(path);
  return response.data;
};

export const updateConversationPreference = async (
  userId: string,
  updates: { pinned?: boolean; archived?: boolean },
) => {
  const response = await api.patch<{ preference: { userId: string; pinned: boolean; archived: boolean } }>(
    `/messages/conversations/${userId}`,
    updates,
  );
  return response.data.preference;
};

export const toggleReaction = async (messageId: string, emoji: string) => {
  const response = await api.post<{ message: Message }>(`/messages/${messageId}/reactions`, { emoji });
  return response.data.message;
};

export const deleteMessage = async (messageId: string) => {
  const response = await api.delete<{ message: Message }>(`/messages/${messageId}`);
  return response.data.message;
};
