import React from 'react';
import { Badge, Dropdown, List } from 'antd';
import { BellOutlined } from '@ant-design/icons';

export interface NotificationCenterProps {
  notifications: Array<{
    id: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
  }>;
  onMarkAsRead: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const notificationItems = notifications.map(item => ({
    key: item.id,
    label: (
      <div onClick={() => onMarkAsRead(item.id)}>
        <div>{item.message}</div>
        <div style={{ fontSize: '12px', color: '#999' }}>
          {new Date(item.createdAt).toLocaleString()}
        </div>
      </div>
    )
  }));

  return (
    <Dropdown menu={{ items: notificationItems }} trigger={['click']}>
      <Badge count={unreadCount} style={{ cursor: 'pointer' }}>
        <BellOutlined style={{ fontSize: '20px' }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationCenter; 