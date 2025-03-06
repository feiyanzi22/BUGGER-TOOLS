import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, message, Timeline } from 'antd';
import MainLayout from '../components/MainLayout';
import { errorReportApi } from '../modules/error-report/api';
import { useAuth } from '../context/AuthContext';
import { 
  ErrorReport, 
  ErrorStatus,
  ErrorSeverity,
  ErrorTypeLabels, 
  ErrorSeverityLabels, 
  ErrorStatusLabels,
  ErrorReportHistory
} from '../modules/error-report/types';

const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [report, setReport] = useState<ErrorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<ErrorReportHistory[]>([]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await errorReportApi.getReportById(id!);
      setReport(data);
      const historyData = await errorReportApi.getReportHistory(id!);
      setHistory(historyData);
    } catch (error) {
      console.error('获取报告详情失败:', error);
      message.error('获取报告详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const handleStatusChange = async (status: ErrorStatus) => {
    if (!currentUser) {
      message.error('请先登录');
      return;
    }

    try {
      await errorReportApi.updateStatus(id!, status, currentUser.id);
      message.success('状态更新成功');
      fetchReport();
    } catch (error) {
      console.error('更新状态失败:', error);
      message.error('更新状态失败');
    }
  };

  if (!report) {
    return null;
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Card loading={loading}>
          <Descriptions title="错误报告详情" bordered>
            <Descriptions.Item label="标题">{report.title}</Descriptions.Item>
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
              <Tag color={
                report.status === ErrorStatus.OPEN ? 'blue' :
                report.status === ErrorStatus.IN_PROGRESS ? 'orange' :
                report.status === ErrorStatus.RESOLVED ? 'green' :
                'gray'
              }>
                {ErrorStatusLabels[report.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="报告人">{report.reporter_name}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(report.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={3}>
              {report.description}
            </Descriptions.Item>
            <Descriptions.Item label="附件" span={3}>
              {report.attachments.length > 0 ? (
                <Space>
                  {report.attachments.map((path, index) => (
                    <Button key={index} type="link" onClick={() => window.open(path)}>
                      附件 {index + 1}
                    </Button>
                  ))}
                </Space>
              ) : '无'}
            </Descriptions.Item>
          </Descriptions>

          {currentUser && (
            <div style={{ marginTop: 16 }}>
              <Space>
                {Object.values(ErrorStatus).map(status => (
                  <Button
                    key={status}
                    type={report.status === status ? 'primary' : 'default'}
                    onClick={() => handleStatusChange(status)}
                  >
                    {ErrorStatusLabels[status]}
                  </Button>
                ))}
              </Space>
            </div>
          )}

          <Card title="处理历史" style={{ marginTop: 24 }}>
            <Timeline>
              {history.map(item => (
                <Timeline.Item key={item.id}>
                  <p>{item.details}</p>
                  <p>
                    <small>
                      {item.username} - {new Date(item.created_at).toLocaleString()}
                    </small>
                  </p>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ReportDetailPage; 