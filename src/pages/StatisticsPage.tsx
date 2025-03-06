import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Statistic, Table, Tag } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import MainLayout from '../components/MainLayout';
import { 
  ErrorReport, 
  ErrorType, 
  ErrorStatus, 
  ErrorTypeLabels, 
  ErrorStatusLabels,
  ErrorSeverityLabels,
  StatData,
  TypeCount,
  SeverityCount,
  StatusCount
} from '../modules/error-report/types';
import { errorReportService } from '../modules/error-report/service';

const { Title } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StatisticsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<StatData | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await errorReportService.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const typeColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => ErrorTypeLabels[type]
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count'
    }
  ];

  const severityColumns = [
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => ErrorSeverityLabels[severity]
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count'
    }
  ];

  const statusColumns = [
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => ErrorStatusLabels[status]
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count'
    }
  ];

  if (!stats) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          加载中...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Title level={2}>错误报告统计</Title>

        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card>
              <Statistic
                title="总报告数"
                value={stats.totalReports}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="待处理报告"
                value={stats.openReports}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="今日已解决"
                value={stats.resolvedToday}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={8}>
            <Card title="按类型统计" loading={loading}>
              <Table
                columns={typeColumns}
                dataSource={stats.byType}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="按严重程度统计" loading={loading}>
              <Table
                columns={severityColumns}
                dataSource={stats.bySeverity}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="按状态统计" loading={loading}>
              <Table
                columns={statusColumns}
                dataSource={stats.byStatus}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        <Card title="最近报告" style={{ marginTop: '24px' }}>
          <Table
            dataSource={stats.recentReports}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: '标题',
                dataIndex: 'title',
                key: 'title'
              },
              {
                title: '类型',
                dataIndex: 'type',
                key: 'type',
                render: type => <Tag>{ErrorTypeLabels[type]}</Tag>
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: status => {
                  const colors = {
                    new: 'blue',
                    'in-progress': 'orange',
                    resolved: 'green',
                    closed: 'gray'
                  };
                  return <Tag color={colors[status]}>{ErrorStatusLabels[status]}</Tag>;
                }
              },
              {
                title: '报告时间',
                dataIndex: 'created_at',
                key: 'created_at',
                render: time => new Date(time).toLocaleString()
              }
            ]}
          />
        </Card>
      </div>
    </MainLayout>
  );
};

export default StatisticsPage; 