import React, { useState, useEffect } from 'react';
import { Card, Space, Select, Button } from 'antd';
import MainLayout from '../components/MainLayout';
import ErrorReportList from '../components/ErrorReportList';
import { errorReportApi } from '../modules/error-report/api';
import { ErrorType, ErrorStatus, ErrorTypeLabels, ErrorStatusLabels } from '../modules/error-report/types';
import { useNavigate } from 'react-router-dom';
import type { ErrorReport } from '../modules/error-report/types';

const ErrorReportListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    type: undefined as ErrorType | undefined,
    status: undefined as ErrorStatus | undefined,
    page: 1,
    pageSize: 10
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await errorReportApi.getReports(filters);
      setReports(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error('获取报告列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const handlePageChange = (page: number, pageSize: number) => {
    setFilters(prev => ({ ...prev, page, pageSize }));
  };

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Card>
          <Space style={{ marginBottom: 16 }}>
            <Select
              allowClear
              placeholder="错误类型"
              style={{ width: 120 }}
              options={Object.entries(ErrorTypeLabels).map(([value, label]) => ({
                value,
                label
              }))}
              value={filters.type}
              onChange={type => setFilters(prev => ({ ...prev, type, page: 1 }))}
            />
            <Select
              allowClear
              placeholder="状态"
              style={{ width: 120 }}
              options={Object.entries(ErrorStatusLabels).map(([value, label]) => ({
                value,
                label
              }))}
              value={filters.status}
              onChange={status => setFilters(prev => ({ ...prev, status, page: 1 }))}
            />
            <Button type="primary" onClick={() => navigate('/reports/new')}>
              新建报告
            </Button>
          </Space>

          <ErrorReportList
            reports={reports}
            loading={loading}
            pagination={{
              current: filters.page,
              pageSize: filters.pageSize,
              total,
              onChange: handlePageChange
            }}
          />
        </Card>
      </div>
    </MainLayout>
  );
};

export default ErrorReportListPage; 