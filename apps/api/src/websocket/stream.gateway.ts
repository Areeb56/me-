import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

export interface StreamGatewayEvents {
  "agent:step": (data: {
    runId: string;
    agentType: string;
    step: string;
    output: unknown;
    timestamp: string;
  }) => void;
  "agent:done": (data: {
    runId: string;
    agentType: string;
    result: unknown;
    tokensUsed: number;
  }) => void;
  "deal:updated": (data: {
    dealId: string;
    oldStage: string;
    newStage: string;
  }) => void;
  "email:sent": (data: {
    emailId: string;
    contactName: string;
    companyName: string;
  }) => void;
  "email:replied": (data: {
    emailId: string;
    snippet: string;
  }) => void;
  "metric:update": (data: {
    key: string;
    value: number;
    delta: number;
  }) => void;
}

export class StreamGateway {
  private io: Server;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
        methods: ["GET", "POST"],
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on("join:agent-runs", () => {
        socket.join("agent-runs");
        console.log(`Client ${socket.id} joined agent-runs`);
      });

      socket.on("join:pipeline", () => {
        socket.join("pipeline");
        console.log(`Client ${socket.id} joined pipeline`);
      });

      socket.on("join:emails", () => {
        socket.join("emails");
        console.log(`Client ${socket.id} joined emails`);
      });

      socket.on("join:analytics", () => {
        socket.join("analytics");
        console.log(`Client ${socket.id} joined analytics`);
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  emitAgentStep(data: StreamGatewayEvents["agent:step"] extends (d: infer D) => void ? D : never) {
    this.io.to("agent-runs").emit("agent:step", data);
  }

  emitAgentDone(data: StreamGatewayEvents["agent:done"] extends (d: infer D) => void ? D : never) {
    this.io.to("agent-runs").emit("agent:done", data);
  }

  emitDealUpdated(data: StreamGatewayEvents["deal:updated"] extends (d: infer D) => void ? D : never) {
    this.io.to("pipeline").emit("deal:updated", data);
  }

  emitEmailSent(data: StreamGatewayEvents["email:sent"] extends (d: infer D) => void ? D : never) {
    this.io.to("emails").emit("email:sent", data);
  }

  emitEmailReplied(data: StreamGatewayEvents["email:replied"] extends (d: infer D) => void ? D : never) {
    this.io.to("emails").emit("email:replied", data);
  }

  emitMetricUpdate(data: StreamGatewayEvents["metric:update"] extends (d: infer D) => void ? D : never) {
    this.io.to("analytics").emit("metric:update", data);
  }

  getServer() {
    return this.io;
  }
}

let gateway: StreamGateway | null = null;

export function initStreamGateway(httpServer: HttpServer) {
  gateway = new StreamGateway(httpServer);
  return gateway;
}

export function getStreamGateway() {
  if (!gateway) {
    throw new Error("StreamGateway not initialized");
  }
  return gateway;
}
