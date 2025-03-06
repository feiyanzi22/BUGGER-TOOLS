import { Database } from 'sqlite';

export async function up(db: Database): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS error_reports (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      description TEXT NOT NULL,
      reporter TEXT NOT NULL,
      assignee TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (reporter) REFERENCES users (id),
      FOREIGN KEY (assignee) REFERENCES users (id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS report_attachments (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      path TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES error_reports (id) ON DELETE CASCADE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS report_history (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      action TEXT NOT NULL,
      user_id TEXT NOT NULL,
      details TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES error_reports (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
}

export async function down(db: Database): Promise<void> {
  await db.exec('DROP TABLE IF EXISTS report_history');
  await db.exec('DROP TABLE IF EXISTS report_attachments');
  await db.exec('DROP TABLE IF EXISTS error_reports');
} 