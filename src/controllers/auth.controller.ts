import type { NextFunction, Request, Response } from 'express';

import authService from '../services/auth.service.js';
import { createError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';

type UpdateProfileInput = {
	name?: string;
	email?: string;
	password?: string;
};

const register = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name, email, password } = req.body as {
			name?: string;
			email?: string;
			password?: string;
		};
		if (!name || !email || !password)
			throw createError('Please provide name, email and password', 400);

		const result = await authService.register(name, email, password);
		return successResponse(
			res,
			result,
			'User registered successfully',
			201
		);
	} catch (error: unknown) {
		if (error instanceof Error) return next(error);
		return next(new Error('Unknown error occurred in register'));
	}
};

const login = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password } = req.body as {
			email?: string;
			password?: string;
		};
		if (!email || !password)
			throw createError('Please provide email and password', 400);

		const result = await authService.login(email, password);
		return successResponse(res, result, 'Login successful');
	} catch (error: unknown) {
		if (error instanceof Error) return next(error);
		return next(new Error('Unknown error occurred in login'));
	}
};

const getMe = (req: Request, res: Response, next: NextFunction) => {
	try {
		return successResponse(
			res,
			{ user: req.user },
			'User profile retrieved'
		);
	} catch (error: unknown) {
		if (error instanceof Error) return next(error);
		return next(new Error('Unknown error occurred in getMe'));
	}
};

const updateProfile = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const user = await authService.updateProfile(
			req.user.id,
			req.body as UpdateProfileInput
		);
		return successResponse(res, { user }, 'Profile updated successfully');
	} catch (error: unknown) {
		if (error instanceof Error) return next(error);
		return next(new Error('Unknown error occurred in updateProfile'));
	}
};

export default { register, login, getMe, updateProfile };
