import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import fs from 'node:fs/promises';
import { Workspaces } from '../src/core/workspaces.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// electron-updater exposes CommonJS exports, not native ESM named exports.
const { autoUpdater } = require('electron-updater') as typeof import('electron-updater');
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AgentCore } from '../src/core/agent-core.js';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
let workspaces: Workspaces;
function createWindow(){const win=new BrowserWindow({width:1200,height:800,webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false}}); if(app.isPackaged) win.loadFile(path.join(__dirname,'../renderer/index.html')); else win.loadURL('http://localhost:5173');}
app.whenReady().then(()=>{
 workspaces = new Workspaces(path.join(app.getPath('userData'), 'projects.json'));
 ipcMain.handle('projects:list',()=>workspaces.list());
 ipcMain.handle('projects:open',async()=>{ const choice=await dialog.showOpenDialog({properties:['openDirectory']}); return choice.canceled?null:workspaces.add(choice.filePaths[0]); });
 ipcMain.handle('projects:create',async()=>{ const choice=await dialog.showSaveDialog({title:'Escolha o nome e local da nova pasta',buttonLabel:'Criar projeto'}); if(choice.canceled||!choice.filePath)return null; await fs.mkdir(choice.filePath); return workspaces.add(choice.filePath); });
 ipcMain.handle('projects:remove',(_,id:string)=>workspaces.remove(id));
 ipcMain.handle('agent:run',async(_,id:string,input:string)=>{if(typeof input!=='string'||input.length>20000)throw Error('Pedido inválido.'); const project=await workspaces.get(id);return new AgentCore(project.path).run(input);});
 ipcMain.handle('agent:read',async(_,id:string,p:string)=>new AgentCore((await workspaces.get(id)).path).readFile(p));
 ipcMain.handle('app:update-check',async()=>{if(!app.isPackaged)return {status:'dev'}; try{await autoUpdater.checkForUpdates();return {status:'checked'};}catch(error){return {status:'error',message:String(error)}}});
 createWindow(); if(app.isPackaged)void autoUpdater.checkForUpdatesAndNotify().catch(error=>console.error('Atualização indisponível:',String(error)));
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});

