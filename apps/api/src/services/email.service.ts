import nodemailer from "nodemailer";
import { db } from "../db";
import { outreachEmails, contacts, emailConnections } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY ?? "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "hex"
);

function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export class EmailService {
  private transporters: Map<string, nodemailer.Transporter> = new Map();

  async getConnection(connectionId: string) {
    const [conn] = await db
      .select()
      .from(emailConnections)
      .where(eq(emailConnections.id, connectionId))
      .limit(1);

    if (!conn) throw new Error(`Email connection ${connectionId} not found`);
    if (!conn.isConnected) throw new Error(`Email connection ${connectionId} is not active`);

    const credentials = JSON.parse(decrypt(conn.credentials));

    if (conn.provider === "smtp") {
      return nodemailer.createTransport({
        host: credentials.host,
        port: credentials.port,
        secure: credentials.secure,
        auth: {
          user: credentials.user,
          pass: credentials.pass,
        },
      });
    }

    if (conn.provider === "gmail") {
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: conn.emailAddress,
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
          refreshToken: credentials.refreshToken,
        },
      });
    }

    throw new Error(`Unsupported provider: ${conn.provider}`);
  }

  async sendOutreachEmail(emailId: string): Promise<{ success: boolean; messageId?: string }> {
    const [email] = await db
      .select({
        id: outreachEmails.id,
        subject: outreachEmails.subject,
        body: outreachEmails.body,
        contactId: outreachEmails.contactId,
        threadId: outreachEmails.threadId,
      })
      .from(outreachEmails)
      .where(eq(outreachEmails.id, emailId))
      .limit(1);

    if (!email) throw new Error(`Email ${emailId} not found`);

    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, email.contactId))
      .limit(1);

    if (!contact?.email) throw new Error(`Contact email not found for ${email.contactId}`);

    const [conn] = await db
      .select()
      .from(emailConnections)
      .where(eq(emailConnections.isConnected, true))
      .limit(1);

    if (!conn) throw new Error("No active email connection");

    const transporter = await this.getConnection(conn.id);

    const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_API_URL}/track/open/${email.id}" width="1" height="1" style="display:none" />`;

    const headers: Record<string, string> = {
      "List-Unsubscribe": `<${process.env.NEXT_PUBLIC_API_URL}/unsubscribe/${email.id}>`,
      "X-Campaign-Id": emailId,
    };

    if (email.threadId) {
      headers["In-Reply-To"] = email.threadId;
      headers["References"] = email.threadId;
    }

    const info = await transporter.sendMail({
      from: `"${conn.emailAddress}" <${conn.emailAddress}>`,
      to: contact.email,
      subject: email.subject ?? "",
      html: `${email.body}${trackingPixel}`,
      headers,
    });

    await db
      .update(outreachEmails)
      .set({
        status: "sent",
        sentAt: new Date(),
        messageId: info.messageId,
        threadId: info.messageId,
      })
      .where(eq(outreachEmails.id, emailId));

    return { success: true, messageId: info.messageId };
  }

  async pollInbox(): Promise<{ newEmails: number }> {
    const connections = await db
      .select()
      .from(emailConnections)
      .where(eq(emailConnections.isConnected, true));

    let newEmails = 0;

    for (const conn of connections) {
      if (conn.provider === "gmail") {
        const credentials = JSON.parse(decrypt(conn.credentials));
        const response = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread`,
          {
            headers: {
              Authorization: `Bearer ${credentials.accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          newEmails += data.messages?.length ?? 0;
        }
      }
    }

    return { newEmails };
  }

  async saveConnection(data: {
    provider: string;
    emailAddress: string;
    credentials: Record<string, unknown>;
    dailyLimit?: number;
  }) {
    const encrypted = encrypt(JSON.stringify(data.credentials));

    const [result] = await db
      .insert(emailConnections)
      .values({
        provider: data.provider,
        emailAddress: data.emailAddress,
        credentials: encrypted,
        isConnected: true,
        dailyLimit: data.dailyLimit ?? 50,
      })
      .returning();

    return result;
  }
}
