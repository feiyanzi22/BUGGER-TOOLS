import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  uploadFile: (file: Buffer, filename: string) => 
    ipcRenderer.invoke('save-file', file, filename),
  deleteFile: (path: string) => 
    ipcRenderer.invoke('delete-file', path),
  // 密码操作
  hashPassword: (password: string) =>
    ipcRenderer.invoke('hash-password', password),
}); 