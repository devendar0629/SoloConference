// import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const DB_URL = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

export default defineConfig({
    out: "./src/db/migrations",
    schema: "./src/db/schema/index.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: DB_URL,
    },
    strict: true,
    verbose: true,
});
