import net from "net";

export function checkServer(ip, port, timeout = 300) {
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
