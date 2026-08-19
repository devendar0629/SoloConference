import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index.js";
import { IS_DEVELOPMENT } from "../config/constants.js";

const DB_URL = process.env.DB_URL;

const pool = new Pool({
    connectionString: DB_URL,
});

export const db = drizzle(pool, {
    schema,
    logger: IS_DEVELOPMENT,
});
