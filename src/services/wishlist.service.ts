import prisma from '../config/prisma';
import { createError } from '../utils/errors.js';

class WishlistService {
	getWishlist(userId: string) {
		return prisma.wishlistItem.findMany({
			where: { userId },
			include: { book: { include: { category: true } } },
			orderBy: { createdAt: 'desc' }
		});
	}

	async addToWishlist(userId: string, bookId: string) {
		const book = await prisma.book.findUnique({ where: { id: bookId } });
		if (!book) throw createError('Book not found', 404);

		return prisma.wishlistItem.upsert({
			where: { userId_bookId: { userId, bookId } },
			update: {},
			create: { userId, bookId },
			include: { book: { include: { category: true } } }
		});
	}

	removeFromWishlist(userId: string, bookId: string) {
		return prisma.wishlistItem.delete({
			where: { userId_bookId: { userId, bookId } }
		});
	}

	async isInWishlist(userId: string, bookId: string) {
		const item = await prisma.wishlistItem.findUnique({
			where: { userId_bookId: { userId, bookId } }
		});
		return Boolean(item);
	}
}

export default new WishlistService();
