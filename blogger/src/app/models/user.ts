// src/models/user.ts
export interface User {
  id?: number;
  username: string;
  email: string;
  role: 'READER' | 'BLOGGER';
  avatar?: string;
  bio?: string;
  createdAt?: Date;
  token?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: 'BLOGGER' | 'READER'; // Ajout du rôle optionnel
}

export interface RegisterReaderRequest {
  username: string;
  email: string;
  password: string;
  role: 'READER';
}

export interface RegisterBloggerRequest {
  username: string;
  email: string;
  password: string;
  role: 'BLOGGER';
}

export interface ErrorResponse {
  message: string;
  timestamp?: Date;
}

export interface GoogleAuthRequest {
  idToken: string;
  role?: 'BLOGGER' | 'READER'; // Spécifier le rôle pour Google
}

export interface UpdateProfileRequest {
    username?: string;
    avatar?: string;
    bio?: string;
}
