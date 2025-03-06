declare global {
  interface Window {
    electronAPI: {
      hashPassword: (password: string) => Promise<string>;
      // ... 其他 API
    }
  }
}

export const hashPassword = async (password: string): Promise<string> => {
  return window.electronAPI.hashPassword(password);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
}; 