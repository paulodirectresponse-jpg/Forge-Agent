const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('forge', {
  projects: {
    list: () => ipcRenderer.invoke('projects:list'),
    open: () => ipcRenderer.invoke('projects:open'),
    create: () => ipcRenderer.invoke('projects:create'),
    remove: (id) => ipcRenderer.invoke('projects:remove', id),
    addRemote: (input) => ipcRenderer.invoke('projects:add-remote', input),
    syncRemote: (id) => ipcRenderer.invoke('projects:sync-remote', id),
  },
  conversations: {
    list: (projectId) => ipcRenderer.invoke('conversations:list', projectId),
    create: (projectId) => ipcRenderer.invoke('conversations:create', projectId),
    save: (conversation) => ipcRenderer.invoke('conversations:save', conversation),
  },
  run: (id, input) => ipcRenderer.invoke('agent:run', id, input),
  execute: (id, plan) => ipcRenderer.invoke('agent:execute', id, plan),
  read: (id, file) => ipcRenderer.invoke('agent:read', id, file),
  checkForUpdates: () => ipcRenderer.invoke('app:update-check'),
  oneai: {
    get: () => ipcRenderer.invoke('oneai:get'),
    save: (config) => ipcRenderer.invoke('oneai:save', config),
    test: () => ipcRenderer.invoke('oneai:test'),
  },
});

