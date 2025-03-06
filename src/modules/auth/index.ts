// 用户类型定义
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user' | 'manager';
  department: string;
}

// 认证服务
export class AuthService {
  // 登录方法
  async login(username: string, password: string): Promise<User | null> {
    // 这里应该是实际的API调用
    // 为了演示，我们使用模拟数据
    if (username === 'admin' && password === 'admin') {
      return {
        id: '1',
        username: 'admin',
        role: 'admin',
        department: '管理部门'
      };
    }
    
    if (username === 'user' && password === 'user') {
      return {
        id: '2',
        username: 'user',
        role: 'user',
        department: '技术部门'
      };
    }
    
    return null;
  }

  // 获取当前用户信息
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

  // 登出方法
  logout(): void {
    localStorage.removeItem('currentUser');
  }
}

// 导出单例实例
export const authService = new AuthService(); 