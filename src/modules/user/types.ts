export interface User {
  id: string;
  username: string;
  role: string;
  department: string;
  createTime: Date;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
  department: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
} 