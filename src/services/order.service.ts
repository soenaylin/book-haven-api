import type { OrderStatus, Prisma, Role } from '@prisma/client';

import cartService from './cart.service.js';
import promoService from './promo.service.js';
import prisma from '../config/prisma.js';
import { createError, toPositiveInt } from '../utils/errors';

type DirectOrderItem = {
	bookId: string;
	quantity: number;
};

type ItemToProcess = {
	bookId: string;
	quantity: number;
	book: {
		id: string;
		title: string;
		price: number;
		stock: number;
	};
};

class OrderService {
	calculateShipping(subtotal: number) {
		return subtotal > 50 ? 0 : 5.99;
	}

	async createOrder(
		userId: string,
		addressId: string,
		directItems: DirectOrderItem[] | null = null,
		promoCode: string | null = null,
		userRole: Role = 'USER'
	) {
		const itemsToProcess: ItemToProcess[] = [];
		let cartId: string | null = null;

		if (directItems?.length) {
			for (const item of directItems) {
				if (!Number.isInteger(item.quantity) || item.quantity < 1) {
					throw createError('Item quantity must be at least 1', 400);
				}

				const book = await prisma.book.findUnique({
					where: { id: item.bookId }
				});
				if (!book) {
					throw createError('Book not found', 404);
				}

				itemsToProcess.push({
					bookId: item.bookId,
					quantity: item.quantity,
					book
				});
			}
		} else {
			const cart = await cartService.getCart(userId);
			if (!cart.items.length) throw createError('Cart is empty', 400);
			itemsToProcess.push(...cart.items);
			cartId = cart.id;
		}

		const address = await prisma.address.findFirst({
			where: { id: addressId, userId }
		});
		if (!address) throw createError('Address not found', 404);

		let subtotal = 0;
		for (const item of itemsToProcess) {
			if (item.book.stock < item.quantity) {
				throw createError(
					`Not enough stock for book: ${item.book.title}`,
					400
				);
			}
			subtotal += item.book.price * item.quantity;
		}

		const shippingCost = this.calculateShipping(subtotal);
		let discountAmount = 0;
		let appliedPromo: Awaited<
			ReturnType<typeof promoService.validatePromoCode>
		> | null = null;

		if (promoCode) {
			appliedPromo = await promoService.validatePromoCode(
				promoCode,
				subtotal,
				userId,
				userRole
			);
			discountAmount = appliedPromo.discountAmount;
		}

		const totalPrice = subtotal + shippingCost - discountAmount;

		const order = await prisma.$transaction(async (tx) => {
			const newOrder = await tx.order.create({
				data: {
					userId,
					addressId,
					subtotal,
					shippingCost,
					discountAmount,
					totalPrice,
					promoCode: appliedPromo?.code ?? null,
					status: 'PENDING',
					items: {
						create: itemsToProcess.map((item) => ({
							bookId: item.bookId,
							price: item.book.price,
							quantity: item.quantity
						}))
					}
				},
				include: { items: true }
			});

			if (appliedPromo) {
				await tx.promoCode.update({
					where: { code: appliedPromo.code },
					data: { usageCount: { increment: 1 } }
				});
			}

			for (const item of itemsToProcess) {
				await tx.book.update({
					where: { id: item.bookId },
					data: {
						stock: { decrement: item.quantity },
						salesCount: { increment: item.quantity }
					}
				});

				// TODO: Send notification to admin when stock is low
			}

			if (!directItems?.length && cartId) {
				await tx.cartItem.deleteMany({ where: { cartId } });
			}

			return newOrder;
		});

		// TODO: Send notification to admin about new order

		return order;
	}

	async getUserOrders(
		userId: string,
		filters: { page?: string | number; limit?: string | number }
	) {
		const page = toPositiveInt(filters.page, 1);
		const limit = toPositiveInt(filters.limit, 10, 50);
		const skip = (page - 1) * limit;

		const [orders, total] = await Promise.all([
			prisma.order.findMany({
				where: { userId },
				include: {
					items: { include: { book: true } },
					address: true
				},
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit
			}),
			prisma.order.count({ where: { userId } })
		]);

		return {
			orders,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit)
			}
		};
	}

	async getOrderById(userId: string, orderId: string) {
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				items: { include: { book: true } },
				address: true
			}
		});

		if (!order) throw createError('Order not found', 404);

		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user || (order.userId !== userId && user.role !== 'ADMIN')) {
			throw createError('Not authorized to view this order', 403);
		}

		return order;
	}

	async getAllOrders(filters: {
		page?: string | number;
		limit?: string | number;
		status?: string;
		search?: string;
	}) {
		const page = toPositiveInt(filters.page, 1);
		const limit = toPositiveInt(filters.limit, 10, 50);
		const skip = (page - 1) * limit;
		const where: Prisma.OrderWhereInput = {};
		const validStatuses: OrderStatus[] = [
			'PENDING',
			'PAID',
			'SHIPPED',
			'DELIVERED',
			'CANCELLED'
		];

		if (
			filters.status &&
			validStatuses.includes(filters.status as OrderStatus)
		) {
			where.status = filters.status as OrderStatus;
		}

		if (filters.search && filters.search !== 'undefined') {
			where.OR = [
				{ id: { contains: filters.search } },
				{ user: { name: { contains: filters.search } } },
				{ user: { email: { contains: filters.search } } }
			];
		}

		const [orders, total, stats, pendingCount, deliveredCount] =
			await Promise.all([
				prisma.order.findMany({
					where,
					include: {
						user: { select: { id: true, name: true, email: true } },
						items: { include: { book: true } },
						address: true
					},
					orderBy: { createdAt: 'desc' },
					skip,
					take: limit
				}),
				prisma.order.count({ where }),
				prisma.order.aggregate({
					where,
					_sum: { totalPrice: true },
					_count: { id: true }
				}),
				prisma.order.count({ where: { ...where, status: 'PENDING' } }),
				prisma.order.count({
					where: { ...where, status: 'DELIVERED' }
				})
			]);

		return {
			orders,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit)
			},
			stats: {
				totalRevenue: stats._sum.totalPrice || 0,
				pendingCount,
				deliveredCount
			}
		};
	}

	async updateOrderStatus(orderId: string, status: OrderStatus) {
		const order = await prisma.order.findUnique({ where: { id: orderId } });
		if (!order) throw createError('Order not found', 404);

		const updatedOrder = await prisma.$transaction(async (tx) => {
			const updated = await tx.order.update({
				where: { id: orderId },
				data: { status },
				include: {
					user: { select: { id: true, name: true, email: true } },
					items: { include: { book: true } },
					address: true
				}
			});

			if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
				for (const item of updated.items) {
					await tx.book.update({
						where: { id: item.bookId },
						data: {
							stock: { increment: item.quantity },
							salesCount: { decrement: item.quantity }
						}
					});
				}
			} else if (order.status === 'CANCELLED' && status !== 'CANCELLED') {
				for (const item of updated.items) {
					const book = await tx.book.findUnique({
						where: { id: item.bookId }
					});
					if (!book || book.stock < item.quantity) {
						throw createError(
							`Not enough stock to restore order for book: ${item.book.title}`,
							400
						);
					}

					await tx.book.update({
						where: { id: item.bookId },
						data: {
							stock: { decrement: item.quantity },
							salesCount: { increment: item.quantity }
						}
					});
				}
			}

			return updated;
		});

		// TODO: Send notification
		return updatedOrder;
	}
}

export default new OrderService();
