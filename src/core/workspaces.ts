import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export type Workspace = { id: string; name: string; path: string };
export class Workspaces {
  private file: string;
  constructor(file: string) { this.file = file; }
  async list(): Promise<Workspace[]> {
    try {
      const data: unknown = JSON.parse(await fs.readFile(this.file, 'utf8'));
      if (!Array.isArray(data) || !data.every(item => typeof item.id === 'string' && typeof item.name === 'string' && typeof item.path === 'string')) throw Error('Cadastro de projetos inválido. Preserve o arquivo para recuperação.');
      return data;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
  }
  private async save(items: Workspace[]) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    const temporary = `${this.file}.${randomUUID()}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(items, null, 2), 'utf8');
    await fs.rename(temporary, this.file);
  }
  async add(directory: string) {
    const resolved = await fs.realpath(directory);
    if (!(await fs.stat(resolved)).isDirectory()) throw Error('Escolha uma pasta.');
    const items = await this.list();
    const existing = items.find(item => process.platform === 'win32' ? item.path.toLowerCase() === resolved.toLowerCase() : item.path === resolved);
    if (existing) return existing;
    const workspace = { id: randomUUID(), name: path.basename(resolved), path: resolved };
    await this.save([...items, workspace]);
    return workspace;
  }
  async remove(id: string) { await this.save((await this.list()).filter(item => item.id !== id)); }
  async get(id: string) {
    const item = (await this.list()).find(item => item.id === id);
    if (!item) throw Error('Selecione um projeto cadastrado.');
    return item;
  }
}
