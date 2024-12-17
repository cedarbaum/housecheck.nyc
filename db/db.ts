import { drizzle as neonDrizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: "../.env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = neonDrizzle(pool);
