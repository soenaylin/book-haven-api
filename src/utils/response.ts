import type { Response } from 'express';
import type { ApiFailure, ApiSuccess } from '../types/index.js';

export const successResponse = <T>(
	res: Response,
	data: T,
	message = 'Success',
	statusCode = 200
) => {
	const body: ApiSuccess<T> = {
		success: true,
		message,
		data
	};

	return res.status(statusCode).json(body);
};

export const errorResponse = (
	res: Response,
	message = 'Internal Server Error',
	statusCode = 500
) => {
	const body: ApiFailure = {
		success: false,
		message
	};

	return res.status(statusCode).json(body);
};
