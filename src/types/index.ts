import type { Role, Book, Category } from '@prisma/client';

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

export type PaginationQuery = {
	page?: string | number;
	limit?: string | number;
};

export type { Book, Category };

/* eslint-disable @typescript-eslint/no-namespace */

declare global {
	namespace Express {
		interface Request {
			user?: AuthUser;
		}
	}
}
