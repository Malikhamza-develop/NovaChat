import api from './axios';
import { User } from '../../types/Auth';

export const searchUsers = async (query: string): Promise<User[]> => {
  const response = await api.get<{ users: User[] }>('/users/search', {
    params: { q: query },
  });

  return response.data.users;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<{ user: User }>('/users/me');
  return response.data.user;
};

export const updateCurrentUser = async (updates: Pick<User, 'name' | 'avatar'>): Promise<User> => {
  const response = await api.patch<{ user: User }>('/users/me', updates);
  return response.data.user;
};
