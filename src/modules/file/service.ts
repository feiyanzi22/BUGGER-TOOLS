import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export class FileService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(app.getPath('userData'), 'uploads');
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: File): Promise<{ filename: string; path: string }> {
    const ext = path.extname(file.name);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    const buffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(buffer));

    return {
      filename: file.name,
      path: `/uploads/${filename}`
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, path.basename(filePath));
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('删除文件失败:', error);
    }
  }

  getFileUrl(filePath: string): string {
    return `file://${path.join(this.uploadDir, path.basename(filePath))}`;
  }
}

export const fileService = new FileService(); 