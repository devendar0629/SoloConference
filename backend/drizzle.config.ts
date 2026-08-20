import { defineConfig } from "drizzle-kit";

const DB_URL = process.env.DB_URL!;

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
