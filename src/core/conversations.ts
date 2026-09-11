import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export type ConversationMessage = { id: string; role: 'user' | 'agent'; text: string; createdAt: string };
export type Conversation = { id: string; projectId: string; title: string; messages: ConversationMessage[]; updatedAt: string };

export class Conversations {
  private readonly file: string;
  constructor(file: string) { this.file = file; }
  private async read(): Promise<Conversation[]> {
    try { const parsed = JSON.parse(await fs.readFile(this.file, 'utf8')) as unknown; return Array.isArray(parsed) ? parsed as Conversation[] : []; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error; }
  }
  private async write(items: Conversation[]) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    const temporary = `${this.file}.${randomUUID()}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(items, null, 2), 'utf8');
    await fs.rename(temporary, this.file);
  }
  async list(projectId: string) { return (await this.read()).filter(item => item.projectId === projectId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); }
  async save(conversation: Conversation) { const items = await this.read(); const index = items.findIndex(item => item.id === conversation.id); if (index >= 0) items[index] = conversation; else items.push(conversation); await this.write(items); return conversation; }
  create(projectId: string, title = 'Nova conversa'): Conversation { const now = new Date().toISOString(); return { id: randomUUID(), projectId, title, messages: [], updatedAt: now }; }
}

