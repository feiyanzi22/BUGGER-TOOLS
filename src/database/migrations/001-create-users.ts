import { Database } from 'sqlite';

export async function up(db: Database): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // 创建默认管理员账户
  const adminExists = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!adminExists) {
    await db.run(`
      INSERT INTO users (id, username, password, role, department, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      '1',
      'admin',
      // 默认密码: admin123
      'e2d54c549e63b69921467a00b9a6cc96f5399b3c1a62f8c4cd1b6184f7e82eb0',
      'admin',
      'IT',
      new Date().toISOString()
    ]);
  }
}

export async function down(db: Database): Promise<void> {
  await db.exec('DROP TABLE IF EXISTS users');
} 