import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import authRoutes from "./routes/auth.routes.js";
// import errorMiddleware from "./middleware/error.middleware.js";
// import prisma from "./config/prisma.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// app.use("/api/auth", authRoutes);

// Error handling
// app.use(errorMiddleware);

export default app;
