const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dgram = require('dgram');

// Start LAN WebSocket server
require('./server.js');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 600,
        frame: false,            // Remove default Chrome frame
        backgroundColor: "#1e1e1e",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

// Handle window controls
ipcMain.on("minimize", () => mainWindow.minimize());
ipcMain.on("close", () => mainWindow.close());

// Safe UDP discovery handler
ipcMain.handle("discover-server", async () => {
    return new Promise((resolve) => {
        const client = dgram.createSocket('udp4');
        let resolved = false;

        function finish(result) {
            if (!resolved) {
                resolved = true;
                try { client.close(); } catch (e) {}
                resolve(result);
            }
        }

        client.on('error', () => finish(null));

        client.on('message', (msg, rinfo) => {
            if (msg.toString() === "LANCHAT_SERVER_HERE") {
                finish(rinfo.address);
            }
        });

        client.bind(() => {
            try {
                client.setBroadcast(true);
                client.send(
                    Buffer.from("DISCOVER_LANCHAT_SERVER"),
                    41234,
                    "255.255.255.255"
                );
            } catch (e) {
                finish(null);
            }
        });

        setTimeout(() => {
            finish(null);
        }, 2000);
    });
});