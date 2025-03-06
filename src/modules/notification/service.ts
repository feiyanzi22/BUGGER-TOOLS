interface NotificationService {
  // 发送通知
  sendNotification(params: {
    reportId: string;
    userId: string;
    message: string;
    type: 'new' | 'update' | 'resolved';
  }): Promise<void>;

  // 获取用户未读通知
  getUnreadNotifications(userId: string): Promise<Notification[]>;

  // 标记通知为已读
  markAsRead(notificationId: string): Promise<void>;
} 