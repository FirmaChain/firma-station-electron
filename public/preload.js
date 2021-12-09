const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  sendSync: ipcRenderer.sendSync,
  on: ipcRenderer.on,
});
