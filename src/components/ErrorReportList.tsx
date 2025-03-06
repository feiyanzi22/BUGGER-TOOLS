import React from 'react';
import { Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { ErrorReport, ErrorTypeLabels, ErrorSeverityLabels, ErrorStatusLabels } from '../modules/error-report/types';

interface ErrorReportListProps {
  reports: ErrorReport[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

const ErrorReportList: React.FC<ErrorReportListProps> = ({
  reports,
  loading = false,
  pagination
}) => {
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: ErrorReport) => (
        <Link to={`/reports/${record.id}`}>{text}</Link>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{ErrorTypeLabels[type]}</Tag>
      )
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const colors = {
          low: 'green',
          medium: 'orange',
          high: 'red',
          critical: 'purple'
        };
        return <Tag color={colors[severity]}>{ErrorSeverityLabels[severity]}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          open: 'blue',
          'in-progress': 'orange',
          resolved: 'green',
          closed: 'gray'
        };
        return <Tag color={colors[status]}>{ErrorStatusLabels[status]}</Tag>;
      }
    },
    {
      title: '报告人',
      dataIndex: 'reporter_name',
      key: 'reporter_name'
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString()
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={reports}
      rowKey="id"
      loading={loading}
      pagination={pagination}
    />
  );
};

export default ErrorReportList; 