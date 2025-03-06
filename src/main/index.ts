import { app, BrowserWindow } from 'electron';
import path from 'path';
import { setupFileHandlers } from './handlers/file';
import { setupCryptoHandlers } from './handlers/crypto';
import { initializeDatabase, closeDatabase } from '../database/connection';

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    }
  });

  if (process.env.NODE_ENV === 'development') {
    await win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    await win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(async () => {
  await initializeDatabase();
  setupFileHandlers();
  setupCryptoHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  await closeDatabase();
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 