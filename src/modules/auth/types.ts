export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user' | 'manager';
  department: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
} 