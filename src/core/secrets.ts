import { app, safeStorage } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

export class SecretStore {
  private get file() { return path.join(app.getPath('userData'), 'secrets.json'); }
  async get(name: string) {
    try { const data = JSON.parse(await fs.readFile(this.file, 'utf8')) as Record<string, string>; const value = data[name]; return value ? safeStorage.decryptString(Buffer.from(value, 'base64')) : ''; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return ''; throw error; }
  }
  async set(name: string, value: string) {
    if (!safeStorage.isEncryptionAvailable()) throw Error('O armazenamento seguro do Windows não está disponível.');
    let data: Record<string, string> = {};
    try { data = JSON.parse(await fs.readFile(this.file, 'utf8')) as Record<string, string>; } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    data[name] = safeStorage.encryptString(value).toString('base64');
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(data), { encoding: 'utf8', mode: 0o600 });
  }
}

