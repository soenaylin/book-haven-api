import type { Server as HttpServer } from 'node:http';

import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

import notificationService from './services/notification.service.js';
import type { JwtPayload } from './types/index.js';

export const initSocket = (server: HttpServer) => {
	const io = new Server(server, {
		cors: {
			origin: process.env.CORS_ORIGIN || '*',
			methods: ['GET', 'POST']
		},
		transports: ['websocket', 'polling']
	});

	notificationService.setIo(io);

	io.on('connection', async (socket) => {
		const token = socket.handshake.auth?.token as string | undefined;

		if (typeof token === 'string' && token) {
			try {
				const decoded = jwt.verify(
					token,
					process.env.JWT_SECRET || ''
				) as JwtPayload & {
					role?: string;
				};

				await socket.join(`user:${decoded.id}`);

				if (decoded.role === 'ADMIN') {
					await socket.join('admin');
				}
			} catch (error) {
				console.error('Socket authentication failed:', error);
			}
		}
	});

	return io;
};
