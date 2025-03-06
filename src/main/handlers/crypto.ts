import { ipcMain } from 'electron';
import { createHash } from 'crypto';

export function setupCryptoHandlers() {
  ipcMain.handle('hash-password', async (_, password: string) => {
    const hash = createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
  });
} 