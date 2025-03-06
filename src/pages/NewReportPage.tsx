import React, { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import ErrorReportForm from '../components/ErrorReportForm';
import MainLayout from '../components/MainLayout';
import { errorReportApi } from '../modules/error-report/api';
import { useAuth } from '../context/AuthContext';
import type { CreateErrorReportRequest } from '../modules/error-report/types';

const NewReportPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  if (!currentUser) {
    message.error('请先登录');
    navigate('/login');
    return null;
  }

  const handleSubmit = async (values: CreateErrorReportRequest) => {
    try {
      setLoading(true);
      const reportId = await errorReportApi.createReport({
        ...values,
        reporterId: currentUser.id
      });
      message.success('报告创建成功');
      navigate(`/reports/${reportId}`);
    } catch (error) {
      console.error('创建报告失败:', error);
      message.error('创建报告失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <h2>创建错误报告</h2>
        <ErrorReportForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </MainLayout>
  );
};

export default NewReportPage; 