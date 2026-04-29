import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  sendSync: ipcRenderer.sendSync,
  on: ipcRenderer.on,
});
