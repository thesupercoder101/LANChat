const WebSocket = require('ws');
const dgram = require('dgram');
const http = require('http');

// Create HTTP server for WebSocket
const server = http.createServer();
const wss = new WebSocket.Server({ server });

const PORT = 3000;
const UDP_PORT = 41234;
let connectedClients = [];

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');
    connectedClients.push(ws);

    // Broadcast message to all clients
    ws.on('message', (data) => {
        console.log('Message received:', data);
        connectedClients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        connectedClients = connectedClients.filter(client => client !== ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`LANChat WebSocket server running on port ${PORT}`);
});

// UDP broadcast listener
const udpServer = dgram.createSocket('udp4');

udpServer.on('message', (msg, rinfo) => {
    if (msg.toString() === 'DISCOVER_LANCHAT_SERVER') {
        console.log('Discovery request from', rinfo.address);
        const response = Buffer.from('LANCHAT_SERVER_HERE');
        udpServer.send(response, 0, response.length, rinfo.port, rinfo.address);
    }
});

udpServer.bind(UDP_PORT, '0.0.0.0');
console.log(`UDP discovery server listening on port ${UDP_PORT}`);