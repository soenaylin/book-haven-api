import notificationService from './notification.service.js';
import prisma from '../config/prisma.js';
import { createError } from '../utils/errors.js';

class ReviewService {
	getBookReviews(bookId: string) {
		return prisma.review.findMany({
			where: { bookId },
			include: {
				user: {
					select: {
						id: true,
						name: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		});
	}

	async createReview(
		userId: string,
		bookId: string,
		rating: number,
		comment?: string
	) {
		const book = await prisma.book.findUnique({ where: { id: bookId } });
		if (!book) {
			throw createError('Book not found', 404);
		}

		const existingReview = await prisma.review.findUnique({
			where: { userId_bookId: { userId, bookId } }
		});

		if (existingReview) {
			return prisma.review.update({
				where: { id: existingReview.id },
				data: { rating, comment },
				include: { user: { select: { id: true, name: true } } }
			});
		}

		const review = await prisma.review.create({
			data: { userId, bookId, rating, comment },
			include: { user: { select: { id: true, name: true } } }
		});

		await notificationService.notifyAdmins({
			title: 'New Review Submitted',
			message: `${review.user.name} reviewed "${book.title}" with ${rating} stars.`,
			type: 'NEW_REVIEW',
			link: `/books/${bookId}`
		});

		return review;
	}

	async deleteReview(userId: string, reviewId: string, isAdmin = false) {
		const review = await prisma.review.findUnique({
			where: { id: reviewId }
		});

		if (!review) {
			throw createError('Review not found', 404);
		}

		if (review.userId !== userId && !isAdmin) {
			throw createError('Not authorized to delete this review', 403);
		}

		return prisma.review.delete({
			where: { id: reviewId }
		});
	}

	async getBookRatingStats(bookId: string) {
		const reviews = await prisma.review.findMany({
			where: { bookId },
			select: { rating: true }
		});

		if (!reviews.length) {
			return { averageRating: 0, numReviews: 0 };
		}

		const averageRating =
			reviews.reduce((sum, review) => sum + review.rating, 0) /
			reviews.length;
		return {
			averageRating: Number(averageRating.toFixed(1)),
			numReviews: reviews.length
		};
	}
}

export default new ReviewService();
