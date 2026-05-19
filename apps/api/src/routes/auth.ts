import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { Secret } from "jsonwebtoken";
import { env } from "../env";

// JWT options
const getJwtSecret = (): string => {
  const secret = env.JWT_SECRET;
  if (!secret) {
    // In production, this should never happen
    // For development, we provide a fallback but log a warning
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    console.warn("JWT_SECRET is not defined, using fallback for development");
    return "fallback-secret-for-development-only";
  }
  return secret;
};

const JWT_OPTIONS = {
  secret: getJwtSecret(),
  expiresIn: "7d", // 7 days
};

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Register schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const authRoutes = async (app: FastifyInstance) => {
  // Login route
  app.post("/login", async (request, reply) => {
    try {
      // Validate input
      const { email, password } = loginSchema.parse(request.body);
      
      // Find user by email
      const userResult = await db.select().from(users).where(eq(users.email, email));
      if (userResult.length === 0) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }
      
      const user = userResult[0];
      
      // Check password
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = (jwt as any).sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        JWT_OPTIONS.secret,
        { expiresIn: JWT_OPTIONS.expiresIn }
      );
      
      // Update last login
      await db.update(users).set({
        lastLoginAt: new Date(),
      }).where(eq(users.id, user.id));
      
      // Return token and user info (without password)
      const { passwordHash, ...userWithoutPassword } = user;
      return {
        token,
        user: userWithoutPassword,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: "Invalid input", details: error.errors });
      }
      console.error("Login error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Register route (open for demo - should be restricted in production)
  app.post("/register", async (request, reply) => {
    try {
      // Validate input
      const { email, password, firstName, lastName } = registerSchema.parse(request.body);
      
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email));
      if (existingUser.length > 0) {
        return reply.status(409).send({ error: "User already exists" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      // Create user
      const newUser = await db.insert(users).values({
        email,
        passwordHash,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        role: "user", // Default role
      }).returning();
      
      const user = newUser[0];
      
      // Generate JWT token for immediate login
      const token = (jwt as any).sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        JWT_OPTIONS.secret,
        { expiresIn: JWT_OPTIONS.expiresIn }
      );
      
      const { passwordHash: _, ...userWithoutPassword } = user;
      return {
        token,
        user: userWithoutPassword,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: "Invalid input", details: error.errors });
      }
      console.error("Register error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Logout route (invalidate token client-side)
  app.post("/logout", async (request, reply) => {
    // In a more advanced implementation, we might maintain a token blacklist
    // For now, we just return success - the client should discard the token
    return { message: "Logged out successfully" };
  });

  // Optional: Get current user info
  app.get("/me", async (request, reply) => {
    try {
      // This route would typically be protected by auth middleware
      // For simplicity, we skip middleware here but in real app you'd verify JWT
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return reply.status(401).send({ error: "Missing or invalid token" });
      }
      
      const token = authHeader.substring(7);
      const decoded = (jwt as any).verify(token, getJwtSecret()) as { userId: string };
      
      const userResult = await db.select().from(users).where(eq(users.id, decoded.userId));
      if (userResult.length === 0) {
        return reply.status(404).send({ error: "User not found" });
      }
      
      const { passwordHash, ...userWithoutPassword } = userResult[0];
      return { user: userWithoutPassword };
    } catch (error) {
      return reply.status(401).send({ error: "Invalid or expired token" });
    }
  });
}
