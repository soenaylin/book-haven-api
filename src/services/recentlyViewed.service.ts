import prisma from '../config/prisma';
import { createError } from '../utils/errors';

class RecentlyViewedService {
	getRecentlyViewed(userId: string, limit = 10) {
		return prisma.recentlyViewed.findMany({
			where: { userId },
			include: { book: { include: { category: true } } },
			orderBy: { viewedAt: 'desc' },
			take: limit
		});
	}

	async trackView(userId: string, bookId: string) {
		const book = await prisma.book.findUnique({ where: { id: bookId } });
		if (!book) throw createError('Book not found', 404);

		return prisma.recentlyViewed.upsert({
			where: { userId_bookId: { userId, bookId } },
			update: { viewedAt: new Date() },
			create: { userId, bookId },
			include: { book: { include: { category: true } } }
		});
	}

	clearRecentlyViewed(userId: string) {
		return prisma.recentlyViewed.deleteMany({ where: { userId } });
	}
}

export default new RecentlyViewedService();
