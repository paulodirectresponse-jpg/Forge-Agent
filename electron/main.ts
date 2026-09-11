import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AgentCore } from '../src/core/agent-core.js';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const core=new AgentCore(process.cwd());
function createWindow(){const win=new BrowserWindow({width:1200,height:800,webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false}}); if(app.isPackaged) win.loadFile(path.join(__dirname,'../renderer/index.html')); else win.loadURL('http://localhost:5173');}
app.whenReady().then(()=>{ipcMain.handle('agent:run',(_,input)=>core.run(input)); ipcMain.handle('agent:read',(_,p)=>core.readFile(p)); ipcMain.handle('app:update-check',async()=>{if(!app.isPackaged)return {status:'dev'}; try{await autoUpdater.checkForUpdates();return {status:'checked'};}catch(error){return {status:'error',message:String(error)}}}); createWindow(); if(app.isPackaged) autoUpdater.checkForUpdatesAndNotify();});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});

