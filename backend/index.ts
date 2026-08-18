import { server } from "./src/server.js";
import { db } from "./src/db/index.js";
import { initSocketServer } from "./src/socket-server.js";

const SERVER_PORT = parseInt(process.env.SERVER_PORT ?? "3000") || 3000;
const SERVER_HOST = process.env.SERVER_HOST ?? "localhost";

async function main() {
    try {
        // Try to connect to the database
        await db.execute("SELECT 1").then(() => {
            console.log("✨ Database connection successful");
        });

        initSocketServer(server);

        server.listen(SERVER_PORT, SERVER_HOST, () => {
            console.log(
                `⚡ Server is running on http://${SERVER_HOST}:${SERVER_PORT}`,
            );
        });
    } catch (error) {
        console.error("❌ Error starting server:", error);
        process.exit(1);
    }
}

main();
