import { FastifyInstance } from "fastify";
import FastifyWebsocket from "@fastify/websocket";

export const setupWebSocket = (app: FastifyInstance) => {
  app.register(FastifyWebsocket);

  app.after(() => {
    app.get("/ws/:clientId", { websocket: true }, (connection, req) => {
      const { clientId } = req.params as { clientId: string };

      console.log(`WebSocket client connected: ${clientId}`);

      // Handle incoming messages
      connection.socket.on("message", (message: Buffer) => {
        const msg = message.toString();
        console.log(`Received message from ${clientId}: ${msg}`);

        // Echo back for now - in real implementation, this would handle specific messages
        connection.socket.send(`Echo: ${msg}`);
      });

      // Handle connection close
      connection.socket.on("close", (code: number, reason: Buffer) => {
        console.log(`WebSocket client disconnected: ${clientId} (code: ${code})`);
      });

      // Handle errors
      connection.socket.on("error", (error: Error) => {
        console.error(`WebSocket error for ${clientId}:`, error);
      });
    });
  });
};
