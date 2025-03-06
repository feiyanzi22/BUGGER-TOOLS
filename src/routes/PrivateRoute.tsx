import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // 用户未登录，重定向到登录页
    return <Navigate to="/login" replace />;
  }

  // 用户已登录，渲染子组件
  return <>{children}</>;
}; 