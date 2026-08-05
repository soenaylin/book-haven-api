import type { NextFunction, Request, Response } from 'express';
import reviewService from '../services/review.service.js';
import { createError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';

const getBookReviews = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { bookId } = req.params as { bookId: string };
		if (!bookId) throw createError('Book ID is required', 400);

		const reviews = await reviewService.getBookReviews(bookId);
		const stats = await reviewService.getBookRatingStats(bookId);
		return successResponse(
			res,
			{ reviews, stats },
			'Reviews retrieved successfully'
		);
	} catch (error) {
		return next(error);
	}
};

const createReview = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const { rating, comment } = req.body;
		if (!rating) throw createError('Rating is required', 400);
		if (!comment) throw createError('Comment is required', 400);

		const numericRating = Number(rating);

		if (
			!Number.isInteger(numericRating) ||
			numericRating < 1 ||
			numericRating > 5
		) {
			throw createError('Rating must be between 1 and 5', 400);
		}

		const review = await reviewService.createReview(
			req.user.id,
			req.params.bookId as string,
			numericRating,
			comment
		);
		return successResponse(res, { review }, 'Review created successfully');
	} catch (error) {
		return next(error);
	}
};

const deleteReview = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		await reviewService.deleteReview(
			req.user.id,
			req.params.reviewId as string,
			req.user.role === 'ADMIN'
		);
		return successResponse(res, null, 'Review deleted successfully');
	} catch (error) {
		return next(error);
	}
};

const createReviews = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const { bookId, rating, comment } = req.body as {
			bookId: string;
			rating: number;
			comment?: string;
		};
		if (!bookId || !rating)
			throw createError('Book ID and rating are required', 400);

		const review = await reviewService.createReview(
			req.user.id,
			bookId,
			rating,
			comment
		);
		return successResponse(res, { review }, 'Review created successfully');
	} catch (error) {
		return next(error);
	}
};

const updateReview = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const { reviewId } = req.params as { reviewId: string };
		const { rating, comment } = req.body as {
			rating?: number;
			comment?: string;
		};
		if (!reviewId) throw createError('Review ID is required', 400);

		// const review = await reviewService.updateReview(
		// 	req.user.id,
		// 	reviewId,
		// 	rating,
		// 	comment
		// );
		// return successResponse(res, { review }, 'Review updated successfully');
	} catch (error) {
		return next(error);
	}
};

const deleteReviews = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const { reviewId } = req.params as { reviewId: string };
		if (!reviewId) throw createError('Review ID is required', 400);

		await reviewService.deleteReview(req.user.id, reviewId);
		return successResponse(res, null, 'Review deleted successfully');
	} catch (error) {
		return next(error);
	}
};

const getBookRatingStats = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { bookId } = req.params as { bookId: string };
		if (!bookId) throw createError('Book ID is required', 400);

		const stats = await reviewService.getBookRatingStats(bookId);
		return successResponse(
			res,
			{ stats },
			'Rating stats retrieved successfully'
		);
	} catch (error) {
		return next(error);
	}
};

export { getBookReviews, createReview, deleteReview };
