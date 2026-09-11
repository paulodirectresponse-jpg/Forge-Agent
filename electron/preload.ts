import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('forge', {
  projects: {
    list: () => ipcRenderer.invoke('projects:list'),
    open: () => ipcRenderer.invoke('projects:open'),
    create: () => ipcRenderer.invoke('projects:create'),
    remove: (id: string) => ipcRenderer.invoke('projects:remove', id),
  },
  run: (id: string, input: string) => ipcRenderer.invoke('agent:run', id, input),
  read: (id: string, file: string) => ipcRenderer.invoke('agent:read', id, file),
  checkForUpdates: () => ipcRenderer.invoke('app:update-check'),
});
