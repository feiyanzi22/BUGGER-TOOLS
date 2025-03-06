import { userService } from './service';
import { User, CreateUserRequest, ChangePasswordRequest } from './types';

export const userApi = {
  async getUsers(): Promise<User[]> {
    return userService.getUsers();
  },

  async createUser(request: CreateUserRequest): Promise<User> {
    return userService.createUser(request);
  },

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    // TODO: 从认证上下文获取当前用户ID
    const userId = '1'; // 临时使用固定值
    return userService.changePassword(userId, request);
  },

  async resetPassword(userId: string): Promise<void> {
    return userService.resetPassword(userId);
  },

  async deleteUser(userId: string): Promise<void> {
    return userService.deleteUser(userId);
  }
}; 