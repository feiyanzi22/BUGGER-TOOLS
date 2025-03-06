import React from 'react';
import { Descriptions, Tag, Button, Space } from 'antd';
import { 
  ErrorReport, 
  ErrorStatus, 
  ErrorSeverity,
  ErrorTypeLabels, 
  ErrorSeverityLabels, 
  ErrorStatusLabels,
  ErrorReportHistory
} from '../modules/error-report/types';
import ErrorReportHistoryComponent from './ErrorReportHistory';

interface ErrorReportDetailProps {
  report: ErrorReport;
  history: ErrorReportHistory[];
  onStatusChange: (status: ErrorStatus) => void;
}

const ErrorReportDetail: React.FC<ErrorReportDetailProps> = ({
  report,
  history,
  onStatusChange
}) => {
  const statusOptions = [
    ErrorStatus.OPEN,
    ErrorStatus.IN_PROGRESS,
    ErrorStatus.RESOLVED,
    ErrorStatus.CLOSED
  ];

  const statusColors = {
    [ErrorStatus.OPEN]: 'blue',
    [ErrorStatus.IN_PROGRESS]: 'orange',
    [ErrorStatus.RESOLVED]: 'green',
    [ErrorStatus.CLOSED]: 'gray'
  };

  return (
    <div>
      <Descriptions bordered>
        <Descriptions.Item label="标题" span={3}>
          {report.title}
        </Descriptions.Item>
        
        <Descriptions.Item label="类型">
          <Tag>{ErrorTypeLabels[report.type]}</Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="严重程度">
          <Tag color={
            report.severity === ErrorSeverity.LOW ? 'green' :
            report.severity === ErrorSeverity.MEDIUM ? 'orange' :
            report.severity === ErrorSeverity.HIGH ? 'red' :
            'purple'
          }>
            {ErrorSeverityLabels[report.severity]}
          </Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="状态">
          <Space>
            <Tag color={statusColors[report.status]}>
              {ErrorStatusLabels[report.status]}
            </Tag>
            {statusOptions.map(status => (
              status !== report.status && (
                <Button
                  key={status}
                  size="small"
                  onClick={() => onStatusChange(status)}
                >
                  更新为{ErrorStatusLabels[status]}
                </Button>
              )
            ))}
          </Space>
        </Descriptions.Item>
        
        <Descriptions.Item label="报告人">
          {report.reporter}
        </Descriptions.Item>
        
        <Descriptions.Item label="创建时间">
          {new Date(report.created_at).toLocaleString()}
        </Descriptions.Item>
        
        <Descriptions.Item label="更新时间">
          {new Date(report.updated_at).toLocaleString()}
        </Descriptions.Item>
        
        <Descriptions.Item label="详细描述" span={3}>
          {report.description}
        </Descriptions.Item>

        {report.attachments && report.attachments.length > 0 && (
          <Descriptions.Item label="附件" span={3}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {report.attachments.map((path, index) => (
                <li key={index}>
                  <a href={path} target="_blank" rel="noopener noreferrer">
                    {path.split('/').pop()}
                  </a>
                </li>
              ))}
            </ul>
          </Descriptions.Item>
        )}
      </Descriptions>

      <h3 style={{ marginTop: 24 }}>处理历史</h3>
      <ErrorReportHistoryComponent history={history} />
    </div>
  );
};

export default ErrorReportDetail; 