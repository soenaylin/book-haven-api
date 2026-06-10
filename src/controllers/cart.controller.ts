import type { NextFunction, Request, Response } from 'express';

import cartService from '../services/cart.service';
import { createError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';

interface CartItemInput {
	bookId: string;
	quantity: number;
}

const getCart = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const cart = await cartService.getCart(req.user.id);
		return successResponse(res, { cart }, 'Cart retrieved successfully');
	} catch (error) {
		return next(error);
	}
};

const addItemToCart = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const { bookId, quantity } = req.body as CartItemInput;
		if (!bookId || quantity === undefined)
			throw createError('Please provide bookId and quantity', 400);

		const cartItem = await cartService.addItemToCart(
			req.user.id,
			bookId,
			Number(quantity)
		);

		return successResponse(
			res,
			{ cartItem },
			'Item added to cart successfully',
			201
		);
	} catch (error) {
		return next(error);
	}
};

const updateItemQuantity = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const { quantity } = req.body as { quantity: number };
		if (quantity === undefined)
			throw createError('Please provide quantity', 400);

		const cartItem = await cartService.updateItemQuantity(
			req.user.id,
			req.params.id as string,
			Number(quantity)
		);

		return successResponse(
			res,
			{ cartItem },
			'Item quantity updated successfully'
		);
	} catch (error) {
		return next(error);
	}
};

const removeItemFromCart = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		await cartService.removeItemFromCart(
			req.user.id,
			req.params.id as string
		);
		return successResponse(
			res,
			null,
			'Item removed from cart successfully'
		);
	} catch (error) {
		return next(error);
	}
};

export default {
	getCart,
	addItemToCart,
	updateItemQuantity,
	removeItemFromCart
};
