import { Server } from "socket.io";
import { Server as HTTPServer } from "http";

let io: Server;

export const initSocket = (httpServer: HTTPServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a room based on user ID if available
    socket.on("joinRoom", (userId: string) => {
      socket.join(userId);
      console.log(`User ${socket.id} joined room ${userId}`);
    });

    // Handle agent events from clients
    socket.on("agentEvent", (data: { agentId: string; event: string; data: any }) => {
      // Broadcast to the user's room
      socket.to(data.agentId).emit("agentEvent", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
