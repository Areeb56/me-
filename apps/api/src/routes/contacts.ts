import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db";
import { contacts } from "../db/schema";
import { leads } from "../db/schema";
import { eq } from "drizzle-orm";
import { authenticate } from "../middleware/auth.middleware";

export const contactsRoutes = async (app: FastifyInstance) => {
  // Protect all routes in this router with authentication
  app.addHook("onRequest", authenticate);

  // Get all contacts
  app.get("/", async (request, reply) => {
    try {
      const allContacts = await db.select().from(contacts);
      return allContacts;
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch contacts" });
    }
  });

  // Get a specific contact
  app.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const contact = await db.select().from(contacts).where(eq(contacts.id, id));
      if (contact.length === 0) {
        return reply.status(404).send({ error: "Contact not found" });
      }
      return contact[0];
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch contact" });
    }
  });

  // Create a new contact
  app.post("/", async (request, reply) => {
    try {
      const contactData = request.body as {
        leadId: string;
        firstName: string;
        lastName: string;
        email: string;
        title?: string;
        linkedinUrl?: string;
        emailVerified?: boolean;
      };
      
      // Validate required fields
      if (!contactData.leadId) {
        return reply.status(400).send({ error: "Lead ID is required" });
      }
      if (!contactData.firstName) {
        return reply.status(400).send({ error: "First name is required" });
      }
      if (!contactData.lastName) {
        return reply.status(400).send({ error: "Last name is required" });
      }
      if (!contactData.email) {
        return reply.status(400).send({ error: "Email is required" });
      }
      
      // Check if lead exists
      const leadResult = await db.select().from(leads).where(eq(leads.id, contactData.leadId));
      if (leadResult.length === 0) {
        return reply.status(404).send({ error: "Lead not found" });
      }
      
      // Check if contact with this email already exists
      const existingContact = await db.select().from(contacts).where(eq(contacts.email, contactData.email));
      if (existingContact.length > 0) {
        return reply.status(409).send({ error: "Contact with this email already exists" });
      }
      
      const newContact = await db.insert(contacts).values({
        leadId: contactData.leadId,
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email,
        title: contactData.title,
        linkedinUrl: contactData.linkedinUrl,
        emailVerified: contactData.emailVerified || false,
      }).returning();
      
      return newContact[0];
    } catch (error) {
      console.error("Error creating contact:", error);
      return reply.status(500).send({ error: "Failed to create contact" });
    }
  });

  // Update a contact
  app.put("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const contactData = request.body as Partial<{
        leadId: string;
        firstName: string;
        lastName: string;
        email: string;
        title: string;
        linkedinUrl: string;
        emailVerified: boolean;
      }>;
      
      const updatedData: any = {};
      
      if (contactData.leadId !== undefined) updatedData.leadId = contactData.leadId;
      if (contactData.firstName !== undefined) updatedData.firstName = contactData.firstName;
      if (contactData.lastName !== undefined) updatedData.lastName = contactData.lastName;
      if (contactData.email !== undefined) updatedData.email = contactData.email;
      if (contactData.title !== undefined) updatedData.title = contactData.title;
      if (contactData.linkedinUrl !== undefined) updatedData.linkedinUrl = contactData.linkedinUrl;
      if (contactData.emailVerified !== undefined) updatedData.emailVerified = contactData.emailVerified;
      
      // If updating leadId, check if the new lead exists
      if (updatedData.leadId) {
        const leadResult = await db.select().from(leads).where(eq(leads.id, updatedData.leadId));
        if (leadResult.length === 0) {
          return reply.status(404).send({ error: "Lead not found" });
        }
      }
      
      // If updating email, check if it's already taken by another contact
      if (updatedData.email) {
        const existingContact = await db.select().from(contacts).where(eq(contacts.email, updatedData.email));
        if (existingContact.length > 0 && existingContact[0].id !== id) {
          return reply.status(409).send({ error: "Contact with this email already exists" });
        }
      }
      
      updatedData.updatedAt = new Date();
      
      const updatedContact = await db.update(contacts).set(updatedData).where(eq(contacts.id, id)).returning();
      
      if (updatedContact.length === 0) {
        return reply.status(404).send({ error: "Contact not found" });
      }
      
      return updatedContact[0];
    } catch (error) {
      console.error("Error updating contact:", error);
      return reply.status(500).send({ error: "Failed to update contact" });
    }
  });

  // Delete a contact
  app.delete("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const deletedContact = await db.delete(contacts).where(eq(contacts.id, id)).returning();
      
      if (deletedContact.length === 0) {
        return reply.status(404).send({ error: "Contact not found" });
      }
      
      return deletedContact[0];
    } catch (error) {
      return reply.status(500).send({ error: "Failed to delete contact" });
    }
  });
};
