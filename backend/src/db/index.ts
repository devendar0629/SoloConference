import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const DB_URL = process.env.DB_URL;

const pool = new Pool({
    connectionString: DB_URL,
});

export const db = drizzle(pool, {
    schema,
    logger: process.env.NODE_ENV === "development",
});
