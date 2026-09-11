import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Workspaces } from './workspaces.ts';

test('projects survive restart, deduplicate paths, and removal preserves files', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-workspaces-'));
  const project = path.join(root, 'project');
  await fs.mkdir(project);
  await fs.writeFile(path.join(project, 'example.txt'), 'preserve');
  const file = path.join(root, 'registry.json');
  const registry = new Workspaces(file);
  const first = await registry.add(project);
  assert.equal((await registry.add(project)).id, first.id);
  const restarted = new Workspaces(file);
  assert.equal((await restarted.list()).length, 1);
  await restarted.remove(first.id);
  assert.equal((await restarted.list()).length, 0);
  assert.equal(await fs.readFile(path.join(project, 'example.txt'), 'utf8'), 'preserve');
  await assert.rejects(restarted.get(first.id));
});
