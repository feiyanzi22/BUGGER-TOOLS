import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, closeDatabase } from '../database/connection';

// 文件存储路径
const uploadDir = path.join(app.getPath('userData'), 'uploads');

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const createWindow = () => {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, '../preload/index.js')
    }
  });

  // 开发环境下加载开发服务器地址
  if (process.env.VITE_DEV_SERVER_URL) {
    console.log('Development mode - Loading URL:', process.env.VITE_DEV_SERVER_URL);
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境下加载本地文件
    try {
      const indexHtml = path.join(__dirname, '../renderer/index.html');
      console.log('Production mode - Loading:', indexHtml);
      
      if (fs.existsSync(indexHtml)) {
        mainWindow.loadFile(indexHtml);
      } else {
        console.error('找不到index.html文件:', indexHtml);
        mainWindow.loadURL(`data:text/html;charset=utf-8,
          <html>
            <head>
              <title>Error</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
              </style>
            </head>
            <body>
              <h1>Error Loading App</h1>
              <p>Could not find index.html at: ${indexHtml}</p>
              <p>Current directory: ${__dirname}</p>
              <p>App path: ${app.getAppPath()}</p>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Error loading the app:', error);
    }
  }

  // 添加错误处理
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page load failed:', { errorCode, errorDescription });
  });

  return mainWindow;
};

// 当Electron完成初始化时，创建窗口
app.whenReady().then(async () => {
  try {
    // 初始化数据库
    await initializeDatabase();
    
    const mainWindow = createWindow();

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    // 设置IPC处理函数
    setupIpcHandlers();
  } catch (error) {
    console.error('Failed to initialize application:', error);
    app.quit();
  }
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', async () => {
  try {
    await closeDatabase();
  } catch (error) {
    console.error('Error closing database:', error);
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 设置IPC处理函数
function setupIpcHandlers() {
  // 处理文件上传
  ipcMain.handle('upload-file', async (_, buffer: ArrayBuffer, filename: string) => {
    try {
      // 生成唯一文件名
      const uniqueFilename = `${uuidv4()}-${filename}`;
      const filePath = path.join(uploadDir, uniqueFilename);
      
      // 将ArrayBuffer写入文件
      fs.writeFileSync(filePath, Buffer.from(buffer));
      
      console.log(`文件已保存: ${filePath}`);
      
      // 返回文件路径和文件名
      return {
        path: filePath,
        filename: filename
      };
    } catch (error) {
      console.error('文件上传失败:', error);
      throw error;
    }
  });

  // 处理文件删除
  ipcMain.handle('delete-file', async (_, filePath: string) => {
    try {
      // 检查文件是否存在
      if (fs.existsSync(filePath)) {
        // 删除文件
        fs.unlinkSync(filePath);
        console.log(`文件已删除: ${filePath}`);
      } else {
        console.warn(`文件不存在: ${filePath}`);
      }
    } catch (error) {
      console.error('文件删除失败:', error);
      throw error;
    }
  });
} 