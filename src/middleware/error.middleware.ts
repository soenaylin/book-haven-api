import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler } from 'express';

import type { AppError } from '../types/index.js';
import { errorResponse } from '../utils/response.js';

const errorMiddleware: ErrorRequestHandler = (
	err: AppError,
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

	return errorResponse(
		res,
		err.message || 'Internal Server Error',
		err.statusCode || 500
	);
};

export default errorMiddleware;
