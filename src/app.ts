import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';

import errorMiddleware from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import bookRoutes from './routes/book.routes.js';

dotenv.config();

const app = express();

app.use(
	cors({
		origin: process.env.CORS_ORIGIN || '*'
	})
);

app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok', message: 'Bookhaven API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

app.use(errorMiddleware);

export default app;
