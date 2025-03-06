import { errorReportService } from './service';
import type {
  CreateErrorReportRequest,
  GetReportsRequest,
  GetReportsResponse,
  ErrorReport,
  ErrorStatus,
  ErrorReportHistory
} from './types';

export const errorReportApi = {
  async createReport(request: CreateErrorReportRequest): Promise<string> {
    return errorReportService.createReport(request);
  },

  async getReports(options?: GetReportsRequest): Promise<GetReportsResponse> {
    return errorReportService.getReports(options);
  },

  async getReportById(id: string): Promise<ErrorReport | null> {
    return errorReportService.getReportById(id);
  },

  async updateStatus(
    reportId: string,
    status: ErrorStatus,
    userId: string,
    comment?: string
  ): Promise<void> {
    return errorReportService.updateStatus(reportId, status, userId, comment);
  },

  async getReportHistory(reportId: string): Promise<ErrorReportHistory[]> {
    return errorReportService.getReportHistory(reportId);
  }
}; 