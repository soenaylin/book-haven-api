import http from 'node:http';

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

import app from './app.js';
import prisma from './config/prisma.js';
import { initSocket } from './socket.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on http://localhost:${PORT}`);
	console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

const shutdown = (reason: string, error?: unknown) => {
	console.error(reason, error ?? '');
	server.close(() => {
		// Handled the async prisma operation as a standard promise chain
		if (prisma instanceof PrismaClient) {
			prisma
				.$disconnect()
				.then(() => process.exit(error ? 1 : 0))
				.catch((err) => {
					console.error('Error during database disconnect:', err);
					process.exit(1);
				});
		} else {
			process.exit(error ? 1 : 0);
		}
	});
};

process.on(
	'unhandledRejection',
	(error) => void shutdown('Unhandled rejection', error)
);
process.on(
	'uncaughtException',
	(error) => void shutdown('Uncaught exception', error)
);
process.on('SIGTERM', () => void shutdown('SIGTERM received'));
process.on('SIGINT', () => void shutdown('SIGINT received'));
