import prisma from '../config/prisma';
import { createError } from '../utils/errors.js';

class CartService {
	async getCart(userId: string) {
		let cart = await prisma.cart.findUnique({
			where: { userId },
			include: {
				items: {
					include: {
						book: true
					}
				}
			}
		});

		if (!cart) {
			cart = await prisma.cart.create({
				data: { userId },
				include: {
					items: {
						include: {
							book: true
						}
					}
				}
			});
		}

		return cart;
	}

	async addItemToCart(userId: string, bookId: string, quantity: number) {
		if (!Number.isInteger(quantity) || quantity < 1) {
			throw createError('Quantity must be at least 1', 400);
		}

		const cart = await this.getCart(userId);
		const book = await prisma.book.findUnique({ where: { id: bookId } });

		if (!book) throw createError('Book not found', 404);
		if (book.stock < quantity) throw createError('Not enough stock', 400);

		const existingItem = await prisma.cartItem.findUnique({
			where: { cartId_bookId: { cartId: cart.id, bookId } }
		});

		if (existingItem) {
			const newQuantity = existingItem.quantity + quantity;
			if (book.stock < newQuantity)
				throw createError('Not enough stock', 400);

			return prisma.cartItem.update({
				where: { id: existingItem.id },
				data: { quantity: newQuantity }
			});
		}

		return prisma.cartItem.create({
			data: {
				cartId: cart.id,
				bookId,
				quantity
			}
		});
	}

	async updateItemQuantity(userId: string, itemId: string, quantity: number) {
		if (!Number.isInteger(quantity) || quantity < 1) {
			throw createError('Quantity must be at least 1', 400);
		}

		const cart = await this.getCart(userId);
		const item = await prisma.cartItem.findFirst({
			where: {
				id: itemId,
				cartId: cart.id
			},
			include: {
				book: true
			}
		});

		if (!item) throw createError('Item not found in cart', 404);
		if (item.book.stock < quantity)
			throw createError('Not enough stock', 400);

		return prisma.cartItem.update({
			where: { id: itemId },
			data: { quantity }
		});
	}

	async removeItemFromCart(userId: string, itemId: string) {
		const cart = await this.getCart(userId);
		const item = await prisma.cartItem.findFirst({
			where: {
				id: itemId,
				cartId: cart.id
			}
		});

		if (!item) throw createError('Item not found in cart', 404);

		return prisma.cartItem.delete({
			where: { id: itemId }
		});
	}
}

export default new CartService();
