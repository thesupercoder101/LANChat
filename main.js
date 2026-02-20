const { app, BrowserWindow } = require("electron");
const path = require("path");
const os = require("os");
const net = require("net");

const { startServer } = require("./server.js");
const { startDiscoveryResponder } = require("./discoveryServer.js");

const PORT = 3000;

// ---- LAN SCAN FOR EXISTING SERVER ----
function checkServer(ip, port, timeout = 200) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(timeout);

        socket.on("connect", () => {
            socket.destroy();
            resolve(true);
        });

        socket.on("timeout", () => {
            socket.destroy();
            resolve(false);
        });

        socket.on("error", () => {
            resolve(false);
        });

        socket.connect(port, ip);
    });
}

async function findExistingServer() {
    const interfaces = os.networkInterfaces();
    const ips = [];

    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === "IPv4" && !iface.internal) {
                const base = iface.address.split(".").slice(0, 3).join(".");
                for (let i = 1; i < 255; i++) {
                    ips.push(`${base}.${i}`);
                }
            }
        }
    }

    for (const ip of ips) {
        const exists = await checkServer(ip, PORT);
        if (exists) return ip;
    }

    return null;
}

// ---- ELECTRON WINDOW ----
function createWindow(serverIP) {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            additionalArguments: [`--server-ip=${serverIP}`]
        }
    });

    win.loadFile("index.html");
}

// ---- MAIN STARTUP LOGIC ----
async function startLANChat() {
    const existing = await findExistingServer();

    if (existing) {
        console.log("Found LANChat server at:", existing);
        createWindow(existing);
    } else {
        console.log("No server found — starting new server");
        startServer(PORT);
        startDiscoveryResponder(PORT);
        createWindow("localhost");
    }
}

app.whenReady().then(startLANChat);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
