import type { UserRole } from './common';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  departmentId: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
