import { FastifyRequest, FastifyReply } from "fastify";
import * as jwt from "jsonwebtoken";
import { env } from "../env";

// Declare the user property on FastifyRequest
declare module "fastify" {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      role: string;
    };
  }
}

/**
 * Middleware to verify JWT token
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Missing or invalid token" });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Attach user info to request for use in route handlers
    request.user = decoded as {
      userId: string;
      email: string;
      role: string;
    };
  } catch (error) {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}

/**
 * Middleware to check user role
 * @param allowedRoles Array of roles that are allowed to access the route
 */
export function authorize(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // First authenticate
    await authenticate(request, reply);
    
    // Then check role
    const userRole = request.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return reply.status(403).send({ error: "Insufficient permissions" });
    }
  };
}
