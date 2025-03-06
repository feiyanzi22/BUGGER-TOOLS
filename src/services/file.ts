import { ipcRenderer } from 'electron';

export const fileService = {
  getFilePath(filename: string): Promise<string> {
    return ipcRenderer.invoke('get-file-path', filename);
  },

  deleteFile(path: string): Promise<void> {
    return ipcRenderer.invoke('delete-file', path);
  },

  // 获取文件的完整URL
  getFileUrl(filename: string): string {
    return `file://${filename}`;
  }
}; 