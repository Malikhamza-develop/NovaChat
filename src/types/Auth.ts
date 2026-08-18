export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
}


export interface LoginRequest {
  email: string;
  password: string;
}


export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}


export interface AuthResponse {
  token: string;
  user: User;
}