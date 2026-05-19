import { io, Socket } from "socket.io-client";
import { useEffect, useRef } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(WS_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err.message);
    });
  }

  return socket;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = getSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("agent:step");
        socketRef.current.off("agent:done");
        socketRef.current.off("deal:updated");
        socketRef.current.off("email:sent");
        socketRef.current.off("email:replied");
        socketRef.current.off("metric:update");
      }
    };
  }, []);

  return socketRef.current;
}

export function useSocketEvent(event: string, callback: (...args: unknown[]) => void) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [socket, event, callback]);
}
