import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import { getDbConnection } from '../../database/connection';
import { User, LoginRequest } from './types';

export class AuthService {
  private db: Database | null = null;

  private async getDb() {
    if (!this.db) {
      this.db = await getDbConnection();
    }
    return this.db;
  }

  async login(username: string, password: string): Promise<User | null> {
    const db = await this.getDb();
    const user = await db.get(
      `SELECT id, username, role, department 
       FROM users 
       WHERE username = ? AND password = ?`,
      [username, password]
    );

    if (user) {
      // 保存用户信息到本地存储
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }

    return null;
  }

  async getCurrentUser(): Promise<User | null> {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return null;

    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('解析用户信息失败:', error);
      return null;
    }
  }

  async register(user: Omit<User, 'id'> & { password: string }): Promise<User> {
    const db = await this.getDb();
    const id = uuidv4();

    await db.run(
      `INSERT INTO users (id, username, password, role, department)
       VALUES (?, ?, ?, ?, ?)`,
      [id, user.username, user.password, user.role, user.department]
    );

    return {
      id,
      username: user.username,
      role: user.role,
      department: user.department
    };
  }

  logout(): void {
    localStorage.removeItem('currentUser');
  }

  async updateUser(user: Partial<User> & { id: string }): Promise<void> {
    const db = await this.getDb();
    const fields = Object.keys(user).filter(key => key !== 'id');
    
    if (fields.length === 0) return;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => user[field as keyof typeof user]);

    await db.run(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      [...values, user.id]
    );
  }

  async deleteUser(id: string): Promise<void> {
    const db = await this.getDb();
    await db.run('DELETE FROM users WHERE id = ?', [id]);
  }
}

export const authService = new AuthService(); 