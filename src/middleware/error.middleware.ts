import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler } from 'express';

import type { AppError } from '../types/index.js';
import { errorResponse } from '../utils/response.js';

const errorMiddleware: ErrorRequestHandler = (
	err: unknown,
	_req,
	res,
	_next
) => {
	console.error(err);

	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === 'P2002') {
			return errorResponse(
				res,
				'A record with this value already exists',
				409
			);
		}

		if (err.code === 'P2025') {
			return errorResponse(res, 'Record not found', 404);
		}
	}
	const message =
		err instanceof Error ? err.message : 'Internal Server Error';
	const statusCode =
		typeof err === 'object' &&
		err !== null &&
		'statusCode' in err &&
		typeof (err as AppError).statusCode === 'number'
			? (err as AppError).statusCode
			: 500;
	return errorResponse(res, message, statusCode);
};

export default errorMiddleware;
