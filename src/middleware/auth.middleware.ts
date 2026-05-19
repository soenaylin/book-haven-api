import type { Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import prisma from '../config/prisma.js';
import type { JwtPayload, AuthUser } from '../types/index.js';
import { errorResponse } from '../utils/response.js';

export const protect = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const authorization = req.headers.authorization;

	if (!authorization?.startsWith('Bearer ')) {
		return errorResponse(res, 'Not authorized, no token', 401);
	}

	try {
		const token = authorization.split(' ')[1];

		// If the token is missing, handle the error or return early
		if (!token) {
			throw new Error('Authentication token is required'); // Or return a 411/403 response
		}
		const decoded = jwt.verify(
			token,
			(process.env.JWT_SECRET as string) || ''
		) as JwtPayload;

		const user = await prisma.user.findUnique({
			where: { id: decoded.id },
			select: { id: true, name: true, email: true, role: true }
		});

		if (!user) {
			return errorResponse(res, 'Not authorized, user not found', 401);
		}

		(req.user as AuthUser) = user;
		return next();
	} catch {
		return errorResponse(res, 'Not authorized, token failed', 401);
	}
};

export const authorize = (...roles: Role[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return errorResponse(
				res,
				'Not authorized to access this route',
				403
			);
		}

		return next();
	};
};
