import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Remove Prisma-specific parameters from connection string (e.g., ?schema=public)
const connectionString = process.env.DATABASE_URL.split("?")[0];
const client = postgres(connectionString);

export const db = drizzle(client, { schema });

