import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/floboard";
if (!process.env.DATABASE_URL) {
  console.warn("[DB] DATABASE_URL not set — defaulting to postgres://localhost:5432/floboard");
}

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export * from "./schema";
