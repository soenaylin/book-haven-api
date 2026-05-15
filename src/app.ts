import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';

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

// app.use(errorMiddleware);

export default app;
