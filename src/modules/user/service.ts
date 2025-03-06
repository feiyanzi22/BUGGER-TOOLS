import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import { getDbConnection } from '../../database/connection';
import { User, CreateUserRequest } from './types';
import { hashPassword } from '../../utils/crypto';

export interface ChangePasswordRequest {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export class UserService {
  private db: Database | null = null;

  private async getDb() {
    if (!this.db) {
      this.db = await getDbConnection();
    }
    return this.db;
  }

  async getUsers(): Promise<User[]> {
    const db = await this.getDb();
    const users = await db.all('SELECT * FROM users');
    return users.map(user => ({
      ...user,
      createTime: new Date(user.created_at)
    }));
  }

  async createUser(request: CreateUserRequest, operatorId: string): Promise<void> {
    const db = await this.getDb();
    const id = uuidv4();
    const now = new Date();
    const hashedPassword = await hashPassword(request.password);

    await db.run(
      `INSERT INTO users (id, username, password, role, department, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, request.username, hashedPassword, request.role, request.department, now.toISOString()]
    );
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    const db = await this.getDb();
    const hashedPassword = await hashPassword(request.newPassword);
    
    await db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, request.userId]
    );
  }

  async resetPassword(userId: string, operatorId: string): Promise<void> {
    const db = await this.getDb();
    const defaultPassword = '123456'; // 默认密码
    const hashedPassword = await hashPassword(defaultPassword);
    
    await db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
  }

  async deleteUser(userId: string, operatorId: string): Promise<void> {
    const db = await this.getDb();
    await db.run('DELETE FROM users WHERE id = ?', [userId]);
  }
}

export const userService = new UserService(); 