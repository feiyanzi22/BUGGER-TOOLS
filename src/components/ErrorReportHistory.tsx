import React from 'react';
import { Timeline } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { ErrorReportHistory } from '../modules/error-report/types';

interface ErrorReportHistoryProps {
  history: ErrorReportHistory[];
}

const ErrorReportHistory: React.FC<ErrorReportHistoryProps> = ({ history }) => {
  return (
    <Timeline>
      {history.map(item => (
        <Timeline.Item
          key={item.id}
          dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
        >
          <div>
            <strong>{item.username}</strong>
            {item.action === 'status_change' && ' 更新了状态'}
            {item.action === 'comment' && ' 添加了评论'}
            {item.action === 'assign' && ' 分配了处理人'}
          </div>
          <div>{item.details}</div>
          <div style={{ color: '#999' }}>
            {new Date(item.created_at).toLocaleString()}
          </div>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

export default ErrorReportHistory; 