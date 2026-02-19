const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    minimize: () => ipcRenderer.send('minimize'),
    close: () => ipcRenderer.send('close'),
    discoverServer: () => ipcRenderer.invoke('discover-server')
});