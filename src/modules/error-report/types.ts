// 错误类型枚举
export enum ErrorType {
  BUG = 'bug',
  FEATURE = 'feature',
  IMPROVEMENT = 'improvement',
  OTHER = 'other'
}

export const ErrorTypeLabels: Record<ErrorType, string> = {
  [ErrorType.BUG]: '程序错误',
  [ErrorType.FEATURE]: '功能请求',
  [ErrorType.IMPROVEMENT]: '改进建议',
  [ErrorType.OTHER]: '其他'
};

// 严重程度枚举
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export const ErrorSeverityLabels: Record<ErrorSeverity, string> = {
  [ErrorSeverity.LOW]: '低',
  [ErrorSeverity.MEDIUM]: '中',
  [ErrorSeverity.HIGH]: '高',
  [ErrorSeverity.CRITICAL]: '严重'
};

// 状态枚举
export enum ErrorStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export const ErrorStatusLabels: Record<ErrorStatus, string> = {
  [ErrorStatus.OPEN]: '待处理',
  [ErrorStatus.IN_PROGRESS]: '处理中',
  [ErrorStatus.RESOLVED]: '已解决',
  [ErrorStatus.CLOSED]: '已关闭'
};

export interface ErrorReportAttachment {
  id: string;
  filename: string;
  path: string;
  created_at: string;
}

export interface ErrorReportHistory {
  id: string;
  report_id: string;
  action: string;
  user_id: string;
  username?: string;
  details: string;
  created_at: string;
}

export interface FileAttachment {
  filename: string;
  path: string;
}

export interface CreateErrorReportRequest {
  title: string;
  type: ErrorType;
  severity: ErrorSeverity;
  description: string;
  reporterId: string;
  attachments?: FileAttachment[];
}

export interface UpdateErrorReportRequest {
  status?: ErrorStatus;
  assigneeId?: string;
  comment?: string;
}

export interface ErrorReport {
  id: string;
  title: string;
  type: ErrorType;
  severity: ErrorSeverity;
  description: string;
  reporter: string;
  reporter_name?: string;
  assignee?: string;
  assignee_name?: string;
  status: ErrorStatus;
  created_at: string;
  updated_at: string;
  attachments: string[];
}

export interface GetReportsRequest {
  status?: ErrorStatus;
  type?: ErrorType;
  page?: number;
  pageSize?: number;
}

export interface GetReportsResponse {
  items: ErrorReport[];
  total: number;
  page: number;
  pageSize: number;
}

// 修改统计数据的子类型，使其支持数组操作
export type TypeCount = {
  readonly type: ErrorType;
  readonly count: number;
};

export type SeverityCount = {
  readonly severity: ErrorSeverity;
  readonly count: number;
};

export type StatusCount = {
  readonly status: ErrorStatus;
  readonly count: number;
};

// 修改 StatData 接口
export interface StatData {
  readonly totalReports: number;
  readonly openReports: number;
  readonly resolvedToday: number;
  readonly byType: TypeCount[];
  readonly bySeverity: SeverityCount[];
  readonly byStatus: StatusCount[];
  readonly recentReports: ErrorReport[];
} 