import type { Role } from '@prisma/client';

export type AuthUser = {
	id: string;
	name: string;
	email: string;
	role: Role;
};

export type JwtPayload = {
	id: string;
	iat?: number;
	exp?: number;
};

export type ApiSuccess<T> = {
	success: true;
	message: string;
	data: T;
};

export type ApiFailure = {
	success: false;
	message: string;
};

export type AppError = Error & {
	statusCode?: number;
};

/* eslint-disable @typescript-eslint/no-namespace */

declare global {
	namespace Express {
		interface Request {
			user?: AuthUser;
		}
	}
}
