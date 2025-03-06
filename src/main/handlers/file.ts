import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// 确保上传目录存在
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export function setupFileHandlers() {
  // 处理文件上传
  ipcMain.handle('uploadFile', async (_, buffer: Buffer, originalFilename: string) => {
    await ensureUploadDir();
    
    const ext = path.extname(originalFilename);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    
    await fs.writeFile(filePath, buffer);
    
    return {
      filename: originalFilename,
      path: filename  // 只存储相对路径
    };
  });

  // 处理文件删除
  ipcMain.handle('deleteFile', async (_, filename: string) => {
    const filePath = path.join(UPLOAD_DIR, filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('删除文件失败:', error);
      throw error;
    }
  });
} 