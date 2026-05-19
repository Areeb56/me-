import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "../apps/api/src/db/index";

async function runMigrations() {
  try {
    console.log("Running database migrations...");
    await migrate(db, { migrationsFolder: "./apps/api/src/db/migrations" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  }
}

runMigrations();
