const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    minimize: () => ipcRenderer.send('minimize'),
    close: () => ipcRenderer.send('close'),
    discoverServer: () => ipcRenderer.invoke('discover-server'),

    // NEW: receive server IP from main.js
    onServerIP: (callback) => {
        ipcRenderer.on('server-ip', (event, ip) => {
            callback(ip);
        });
    }
});
