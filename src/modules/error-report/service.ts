import { v4 as uuidv4 } from 'uuid';
import { Database } from 'sqlite';
import { getDbConnection } from '../../database/connection';
import { 
  ErrorReport, 
  CreateErrorReportRequest,
  GetReportsRequest,
  GetReportsResponse,
  ErrorStatus,
  ErrorSeverity,
  ErrorType,
  ErrorReportHistory,
  StatData,
  TypeCount,
  SeverityCount,
  StatusCount,
  FileAttachment
} from './types';
import { fileService } from '../file/service';

interface StoredAttachment {
  id: string;
  filename: string;
  path: string;
}

export class ErrorReportService {
  private db: Database | null = null;

  private async getDb() {
    if (!this.db) {
      this.db = await getDbConnection();
    }
    return this.db;
  }

  private async saveAttachments(reportId: string, attachments: FileAttachment[]): Promise<StoredAttachment[]> {
    const db = await this.getDb();
    const now = new Date().toISOString();
    const storedAttachments: StoredAttachment[] = [];

    for (const attachment of attachments) {
      const id = uuidv4();
      await db.run(`
        INSERT INTO report_attachments (id, report_id, filename, path, created_at)
        VALUES (?, ?, ?, ?, ?)
      `, [id, reportId, attachment.filename, attachment.path, now]);

      storedAttachments.push({
        id,
        filename: attachment.filename,
        path: attachment.path
      });
    }

    return storedAttachments;
  }

  async createReport(request: CreateErrorReportRequest): Promise<string> {
    const db = await this.getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO error_reports (
        id, title, type, severity, description, 
        reporter, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        request.title,
        request.type,
        request.severity,
        request.description,
        request.reporterId,
        ErrorStatus.OPEN,
        now,
        now
      ]
    );

    // 保存附件
    if (request.attachments && request.attachments.length > 0) {
      const attachmentValues = request.attachments.map(attachment => [
        uuidv4(),
        id,
        attachment.filename,
        attachment.path,
        now
      ]);

      await db.run(`
        INSERT INTO report_attachments (id, report_id, filename, path, created_at)
        VALUES ${attachmentValues.map(() => '(?, ?, ?, ?, ?)').join(',')}
      `, attachmentValues.flat());
    }

    // 记录历史
    await db.run(
      `INSERT INTO report_history (id, report_id, action, user_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), id, 'create', request.reporterId, '创建错误报告', now]
    );

    return id;
  }

  async getReports(options: GetReportsRequest = {}): Promise<GetReportsResponse> {
    const db = await this.getDb();
    const { status, type, page = 1, pageSize = 10 } = options;
    
    let query = `
      SELECT r.*, 
        u1.username as reporter_name,
        u2.username as assignee_name,
        GROUP_CONCAT(a.path) as attachment_paths
      FROM error_reports r
      LEFT JOIN users u1 ON r.reporter = u1.id
      LEFT JOIN users u2 ON r.assignee = u2.id
      LEFT JOIN report_attachments a ON r.id = a.report_id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (status) {
      conditions.push('r.status = ?');
      params.push(status);
    }

    if (type) {
      conditions.push('r.type = ?');
      params.push(type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY r.id ORDER BY r.created_at DESC';

    // 获取总数
    const countQuery = `SELECT COUNT(DISTINCT r.id) as total FROM error_reports r${
      conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''
    }`;
    const { total } = await db.get(countQuery, params);

    // 添加分页
    query += ' LIMIT ? OFFSET ?';
    params.push(pageSize, (page - 1) * pageSize);

    const items = await db.all(query, params);

    return {
      items: items.map(item => ({
        ...item,
        attachments: item.attachment_paths ? item.attachment_paths.split(',') : []
      })),
      total,
      page,
      pageSize
    };
  }

  async getReportById(id: string): Promise<ErrorReport | null> {
    const db = await this.getDb();
    const report = await db.get(`
      SELECT r.*, 
        u1.username as reporter_name,
        u2.username as assignee_name,
        GROUP_CONCAT(a.path) as attachment_paths
      FROM error_reports r
      LEFT JOIN users u1 ON r.reporter = u1.id
      LEFT JOIN users u2 ON r.assignee = u2.id
      LEFT JOIN report_attachments a ON r.id = a.report_id
      WHERE r.id = ?
      GROUP BY r.id
    `, [id]);

    if (!report) return null;

    return {
      ...report,
      attachments: report.attachment_paths ? report.attachment_paths.split(',') : []
    };
  }

  async updateStatus(
    reportId: string,
    status: ErrorStatus,
    userId: string,
    comment?: string
  ): Promise<void> {
    const db = await this.getDb();
    const now = new Date().toISOString();

    await db.run(
      'UPDATE error_reports SET status = ?, updated_at = ? WHERE id = ?',
      [status, now, reportId]
    );

    await db.run(
      `INSERT INTO report_history (id, report_id, action, user_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        reportId,
        'status_change',
        userId,
        comment || `状态更新为: ${status}`,
        now
      ]
    );
  }

  async getReportHistory(reportId: string): Promise<ErrorReportHistory[]> {
    const db = await this.getDb();
    return db.all(`
      SELECT h.*, u.username
      FROM report_history h
      LEFT JOIN users u ON h.user_id = u.id
      WHERE h.report_id = ?
      ORDER BY h.created_at DESC
    `, [reportId]);
  }

  async getStatistics(): Promise<StatData> {
    const db = await this.getDb();
    
    // 获取总报告数
    const totalReports = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM error_reports'
    );
    
    if (!totalReports) throw new Error('Failed to get total reports count');
    
    // 获取待处理报告数
    const openReports = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM error_reports WHERE status IN (?, ?)`,
      [ErrorStatus.OPEN, ErrorStatus.IN_PROGRESS]
    );
    
    if (!openReports) throw new Error('Failed to get open reports count');
    
    // 获取今日已解决数
    const today = new Date().toISOString().split('T')[0];
    const resolvedToday = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM error_reports WHERE status = ? AND DATE(updated_at) = ?",
      [ErrorStatus.RESOLVED, today]
    );
    
    if (!resolvedToday) throw new Error('Failed to get resolved today count');
    
    // 按类型统计
    interface DbTypeCount {
      type: ErrorType;
      count: number;
    }
    const byTypeResults = await db.all<DbTypeCount>(
      'SELECT type, COUNT(*) as count FROM error_reports GROUP BY type'
    );
    const byType = byTypeResults as unknown as TypeCount[];
    
    // 按严重程度统计
    interface DbSeverityCount {
      severity: ErrorSeverity;
      count: number;
    }
    const bySeverityResults = await db.all<DbSeverityCount>(
      'SELECT severity, COUNT(*) as count FROM error_reports GROUP BY severity'
    );
    const bySeverity = bySeverityResults as unknown as SeverityCount[];
    
    // 按状态统计
    interface DbStatusCount {
      status: ErrorStatus;
      count: number;
    }
    const byStatusResults = await db.all<DbStatusCount>(
      'SELECT status, COUNT(*) as count FROM error_reports GROUP BY status'
    );
    const byStatus = byStatusResults as unknown as StatusCount[];
    
    // 获取最近报告
    interface DbReportResult extends Omit<ErrorReport, 'attachments'> {
      attachment_paths: string | null;
    }

    const recentReportsResults = (await db.all<DbReportResult>(
      `SELECT r.*, 
        u1.username as reporter_name,
        u2.username as assignee_name,
        GROUP_CONCAT(a.path) as attachment_paths
      FROM error_reports r
      LEFT JOIN users u1 ON r.reporter = u1.id
      LEFT JOIN users u2 ON r.assignee = u2.id
      LEFT JOIN report_attachments a ON r.id = a.report_id
      GROUP BY r.id
      ORDER BY r.created_at DESC 
      LIMIT 5`
    )) || [];

    const recentReports = recentReportsResults.map(report => ({
      ...report,
      attachments: report.attachment_paths ? report.attachment_paths.split(',') : []
    })) as ErrorReport[];

    return {
      totalReports: totalReports.count,
      openReports: openReports.count,
      resolvedToday: resolvedToday.count,
      byType,
      bySeverity,
      byStatus,
      recentReports
    };
  }
}

// 创建单例实例
export const errorReportService = new ErrorReportService(); 