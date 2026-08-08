import { type Prisma } from '@prisma/client';

import notificationService from './notification.service.js';
import prisma from '../config/prisma.js';
import { createError, toPositiveInt } from '../utils/errors.js';

type BookFilters = {
	search?: string;
	category?: string;
	availability?: string;
	page?: string | number;
	limit?: string | number;
	sort?: string;
	order?: string;
};

type BookInput = {
	title: string;
	author?: string;
	description: string;
	price: number | string;
	isbn?: string | null;
	stock: number | string;
	coverImage: string;
	categoryId: string;
};

class BookService {
	async getAllBooks(filters: BookFilters) {
		const page = toPositiveInt(filters.page, 1);
		const limit = toPositiveInt(filters.limit, 10, 50);
		const skip = (page - 1) * limit;

		const where: Prisma.BookWhereInput = {};
		if (filters.search) {
			where.OR = [
				{ title: { contains: filters.search } },
				{
					description: { contains: filters.search }
				}
			];
		}
		if (filters.category) {
			where.category = { is: { name: filters.category } };
		}
		if (filters.availability === 'inStock') {
			where.stock = { gt: 0 };
		} else if (filters.availability === 'outOfStock') {
			where.stock = 0;
		}

		const allowedSorts = new Set([
			'createdAt',
			'title',
			'price',
			'stock',
			'salesCount'
		]);
		const proposedSort = filters.sort || '';
		const sort = allowedSorts.has(proposedSort)
			? proposedSort
			: 'createdAt';
		const order = filters.order === 'asc' ? 'asc' : 'desc';

		const [books, total] = await Promise.all([
			prisma.book.findMany({
				where,
				skip,
				take: limit,
				orderBy: { [sort]: order },
				include: {
					category: true,
					reviews: { select: { rating: true } },
					_count: { select: { reviews: true } }
				}
			}),
			prisma.book.count({ where })
		]);

		const booksWithStats = books.map((book) => {
			const ratings = book.reviews.map((review) => review.rating);
			const averageRating =
				ratings.length > 0
					? Number(
							(
								ratings.reduce(
									(sum, rating) => sum + rating,
									0
								) / ratings.length
							).toFixed(1)
						)
					: 0;
			return {
				...book,
				averageRating,
				numReviews: book._count.reviews
			};
		});

		return {
			books: booksWithStats,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit)
			}
		};
	}

	async getBookById(id: string) {
		const book = await prisma.book.findUnique({
			where: { id },
			include: {
				category: true,
				reviews: {
					include: {
						user: { select: { id: true, name: true } }
					},
					orderBy: { createdAt: 'desc' }
				},
				_count: { select: { reviews: true } }
			}
		});

		if (!book) throw createError('Book not found', 404);

		const ratings = book.reviews.map((review) => review.rating);
		const averageRating =
			ratings.length > 0
				? Number(
						(
							ratings.reduce((sum, rating) => sum + rating, 0) /
							ratings.length
						).toFixed(1)
					)
				: 0;

		return {
			...book,
			averageRating,
			numReviews: book._count.reviews
		};
	}

	createBook(data: BookInput) {
		return prisma.book.create({
			data: {
				title: data.title,
				author: data.author || 'Unknown Author',
				description: data.description,
				price: Number(data.price),
				isbn: data.isbn,
				stock: Number(data.stock),
				coverImage: data.coverImage,
				categoryId: data.categoryId
			}
		});
	}

	async updateBook(id: string, data: Partial<BookInput>) {
		const book = await prisma.book.findUnique({ where: { id } });
		if (!book) throw createError('Book not found', 404);

		const updatedBook = await prisma.book.update({
			where: { id },
			data: {
				title: data.title,
				author: data.author,
				description: data.description,
				price:
					data.price === undefined ? undefined : Number(data.price),
				isbn: data.isbn,
				stock:
					data.stock === undefined ? undefined : Number(data.stock),
				coverImage: data.coverImage,
				categoryId: data.categoryId
			}
		});

		if (updatedBook.stock <= 5) {
			await notificationService.notifyAdmins({
				title: 'Low Stock Alert',
				message: `"${updatedBook.title}" is running low no stock (${updatedBook.stock} remaining).`,
				type: 'LOW_STOCK',
				link: `/admin/books?search=${encodeURIComponent(updatedBook.title)}`
			});
		}

		return updatedBook;
	}

	async deleteBook(id: string) {
		const book = await prisma.book.findUnique({ where: { id } });
		if (!book) throw createError('Book not found', 404);
		return prisma.book.delete({ where: { id } });
	}

	async getAllCategories(filters: {
		page?: string | number;
		limit?: string | number;
		search?: string;
	}) {
		const page = toPositiveInt(filters.page, 1);
		const limit = toPositiveInt(filters.limit, 10, 100);
		const skip = (page - 1) * limit;
		const where: Prisma.CategoryWhereInput = {};

		if (filters.search) {
			where.name = {
				contains: filters.search
			};
		}

		const [categories, total] = await Promise.all([
			prisma.category.findMany({
				where,
				orderBy: { name: 'asc' },
				include: {
					_count: {
						select: { books: true }
					}
				},
				skip,
				take: limit
			}),
			prisma.category.count({ where })
		]);

		return {
			categories,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit)
			}
		};
	}

	createCategory(data: { name: string }) {
		return prisma.category.create({ data });
	}

	updateCategory(id: string, data: { name?: string }) {
		return prisma.category.update({ where: { id }, data });
	}

	async deleteCategory(id: string) {
		const booksCount = await prisma.book.count({
			where: { categoryId: id }
		});
		if (booksCount > 0) {
			throw createError(
				'Cannot delete category with books. Please reassign or delete the books first.',
				400
			);
		}

		return prisma.category.delete({ where: { id } });
	}
}

export default new BookService();
