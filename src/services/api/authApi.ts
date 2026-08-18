import api from './axios';

import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../../types/Auth';

export const loginUser = async (
  data: LoginRequest
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const registerUser = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};
