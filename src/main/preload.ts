import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 上传文件
  uploadFile: async (buffer: ArrayBuffer, filename: string) => {
    return await ipcRenderer.invoke('upload-file', buffer, filename);
  },
  
  // 删除文件
  deleteFile: async (path: string) => {
    return await ipcRenderer.invoke('delete-file', path);
  },
  
  // 如果有其他API，例如hashPassword，也可以在这里添加
  hashPassword: async (password: string) => {
    return await ipcRenderer.invoke('hash-password', password);
  }
}); 