import type { NextFunction, Request, Response } from 'express';

import recentlyViewedService from '../services/recentlyViewed.service';
import { createError, toPositiveInt } from '../utils/errors';
import { successResponse } from '../utils/response';

const getRecentlyViewed = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const recentlyViewed = await recentlyViewedService.getRecentlyViewed(
			req.user.id,
			toPositiveInt(req.query.limit, 10, 50)
		);
		return successResponse(
			res,
			{ recentlyViewed },
			'Recently viewed books retrieved'
		);
	} catch (error) {
		return next(error);
	}
};

const trackView = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const { bookId } = req.body as { bookId: string };
		if (!bookId) throw createError('Book ID is required', 400);

		const view = await recentlyViewedService.trackView(req.user.id, bookId);
		return successResponse(res, { view }, 'Book view tracked', 201);
	} catch (error) {
		return next(error);
	}
};

const clearRecentlyViewed = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		await recentlyViewedService.clearRecentlyViewed(req.user.id);
		return successResponse(res, null, 'Recently viewed cleared');
	} catch (error) {
		return next(error);
	}
};

export default { getRecentlyViewed, trackView, clearRecentlyViewed };
