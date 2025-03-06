import React, { createContext, useContext } from 'react';
import { ErrorReportService } from '../modules/error-report/service';
import { UserService } from '../modules/user/service';

interface ApiContextType {
  errorReport: ErrorReportService;
  user: UserService;
}

const ApiContext = createContext<ApiContextType | null>(null);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const api = {
    errorReport: new ErrorReportService(),
    user: new UserService()
  };

  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
}; 