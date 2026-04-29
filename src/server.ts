import http from "http";
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer(): Promise<void> {
    const server = http.createServer(app);

    server.listen(Number(PORT), "0.0.0.0", () => {
        console.log(`Server running on http:localhost:${PORT}`);
    });
}

startServer().catch((err: unknown) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
