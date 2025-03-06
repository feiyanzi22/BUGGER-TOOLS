import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import ErrorReportListPage from '../pages/ErrorReportListPage';
import NewReportPage from '../pages/NewReportPage';
import ReportDetailPage from '../pages/ReportDetailPage';
import StatisticsPage from '../pages/StatisticsPage';
import SettingsPage from '../pages/SettingsPage';
import ProtectedRoute from '../components/ProtectedRoute';
import { createBrowserRouter } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <ErrorReportListPage />
          </ProtectedRoute>
        } />
        <Route path="/reports/new" element={
          <ProtectedRoute>
            <NewReportPage />
          </ProtectedRoute>
        } />
        <Route path="/reports/:id" element={
          <ProtectedRoute>
            <ReportDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/statistics" element={
          <ProtectedRoute>
            <StatisticsPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <PrivateRoute><ErrorReportListPage /></PrivateRoute>
  },
  {
    path: '/reports/new',
    element: <PrivateRoute><NewReportPage /></PrivateRoute>
  },
  {
    path: '/reports/:id',
    element: <PrivateRoute><ReportDetailPage /></PrivateRoute>
  },
  {
    path: '/statistics',
    element: <PrivateRoute><StatisticsPage /></PrivateRoute>
  },
  {
    path: '/settings',
    element: <PrivateRoute><SettingsPage /></PrivateRoute>
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export default AppRoutes; 