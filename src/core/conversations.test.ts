import assert from 'node:assert/strict';
import test from 'node:test';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { Conversations } from './conversations.ts';

test('persists and lists conversations by project', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-conversations-'));
  const store = new Conversations(path.join(root, 'conversations.json'));
  const conversation = store.create('project-1', 'Landing page');
  conversation.messages.push({ id: 'm1', role: 'user', text: 'Criar uma página', createdAt: new Date().toISOString() });
  await store.save(conversation);
  assert.equal((await store.list('project-1')).length, 1);
  assert.equal((await store.list('project-2')).length, 0);
});

