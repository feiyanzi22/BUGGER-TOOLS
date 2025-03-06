import { app } from 'electron';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';

const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
let db: sqlite3.Database | null = null;

// 初始化数据库
export async function initializeDatabase(): Promise<void> {
  try {
    db = await createConnection();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// 关闭数据库
export async function closeDatabase(): Promise<void> {
  if (db) {
    try {
      await closeConnection(db);
      db = null;
      console.log('Database closed successfully');
    } catch (error) {
      console.error('Failed to close database:', error);
      throw error;
    }
  }
}

// 创建数据库连接
function createConnection(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const database = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Could not connect to database', err);
        reject(err);
      } else {
        console.log('Connected to database at:', dbPath);
        resolve(database);
      }
    });
  });
}

// 关闭数据库连接
function closeConnection(database: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    database.close((err) => {
      if (err) {
        console.error('Could not close database connection', err);
        reject(err);
      } else {
        console.log('Database connection closed');
        resolve();
      }
    });
  });
}

// 获取数据库实例
export function getDatabase(): sqlite3.Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
} 