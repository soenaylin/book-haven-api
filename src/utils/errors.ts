import type { AppError } from '../types/index.js';

export const createError = (message: string, statusCode = 500): AppError => {
	const error = new Error(message) as AppError;
	error.statusCode = statusCode;
	return error;
};

export const toPositiveInt = (
	value: unknown,
	fallback: number,
	max = 100
): number => {
	const parsed = Number(value ?? fallback);
	if (!Number.isInteger(parsed) || parsed < 1) return fallback;
	return Math.min(parsed, max);
};
