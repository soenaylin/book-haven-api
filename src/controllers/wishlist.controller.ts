import type { NextFunction, Request, Response } from 'express';

import wishlistService from '../services/wishlist.service.js';
import { createError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';

const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const wishlist = await wishlistService.getWishlist(req.user.id);
		return successResponse(
			res,
			{ wishlist },
			'Wishlist retrieved successfully'
		);
	} catch (error) {
		return next(error);
	}
};

const addToWishlist = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const { bookId } = req.body as { bookId: string };
		if (!bookId) throw createError('Book ID is required', 400);

		const wishlistItem = await wishlistService.addToWishlist(
			req.user.id,
			bookId
		);

		return successResponse(
			res,
			{ wishlistItem },
			'Item added to wishlist',
			201
		);
	} catch (error) {
		return next(error);
	}
};

const removeFromWishlist = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		await wishlistService.removeFromWishlist(
			req.user.id,
			req.params.bookId as string
		);
		return successResponse(res, null, 'Item removed from wishlist');
	} catch (error) {
		return next(error);
	}
};

const checkInWishlist = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const isInWishlist = await wishlistService.isInWishlist(
			req.user.id,
			req.params.bookId as string
		);
		return successResponse(
			res,
			{ isInWishlist },
			'Wishlist status retrieved'
		);
	} catch (error) {
		return next(error);
	}
};

export default {
	getWishlist,
	addToWishlist,
	removeFromWishlist,
	checkInWishlist
};
