import { io } from "socket.io-client";

const server_url = import.meta.env.VITE_API_URL || "http://localhost:8000";
let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(server_url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("error", (error) => {
      console.log("socket error", error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) initSocket();
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
