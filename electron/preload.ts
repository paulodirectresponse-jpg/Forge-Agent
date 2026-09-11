import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('forge', {
  projects: {
    list: () => ipcRenderer.invoke('projects:list'),
    open: () => ipcRenderer.invoke('projects:open'),
    create: () => ipcRenderer.invoke('projects:create'),
    remove: (id: string) => ipcRenderer.invoke('projects:remove', id),
    addRemote: (input: { name: string; remoteUrl: string; branch?: string; owner?: string; repository?: string }) => ipcRenderer.invoke('projects:add-remote', input),
    syncRemote: (id: string) => ipcRenderer.invoke('projects:sync-remote', id),
  },
  conversations: {
    list: (projectId: string) => ipcRenderer.invoke('conversations:list', projectId),
    create: (projectId: string) => ipcRenderer.invoke('conversations:create', projectId),
    save: (conversation: unknown) => ipcRenderer.invoke('conversations:save', conversation),
  },
  run: (id: string, input: string) => ipcRenderer.invoke('agent:run', id, input),
  execute: (id: string, plan: unknown) => ipcRenderer.invoke('agent:execute', id, plan),
  read: (id: string, file: string) => ipcRenderer.invoke('agent:read', id, file),
  checkForUpdates: () => ipcRenderer.invoke('app:update-check'),
  oneai: { get: () => ipcRenderer.invoke('oneai:get'), save: (config: { baseUrl: string; apiKey: string; model?: string }) => ipcRenderer.invoke('oneai:save', config), test: () => ipcRenderer.invoke('oneai:test') },
});

