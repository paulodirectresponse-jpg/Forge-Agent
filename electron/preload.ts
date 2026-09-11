import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('forge',{run:(input:string)=>ipcRenderer.invoke('agent:run',input),read:(p:string)=>ipcRenderer.invoke('agent:read',p),checkForUpdates:()=>ipcRenderer.invoke('app:update-check')});

