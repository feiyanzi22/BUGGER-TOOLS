interface ElectronAPI {
  uploadFile: (buffer: ArrayBuffer, filename: string) => Promise<{
    path: string;
    filename: string;
  }>;
  deleteFile: (path: string) => Promise<void>;
  hashPassword: (password: string) => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {}; 