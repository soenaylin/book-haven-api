import type { OrderStatus } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

import orderService from '../services/order.service.js';
import { createError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';

interface CreateOrderRequest extends Request {
	body: {
		addressId: string;
		items?: Array<{ bookId: string; quantity: number }>;
		promoCode?: string;
	};
}

const createOrder = async (
	req: CreateOrderRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const { addressId, items, promoCode } = req.body;
		if (!addressId) throw createError('Please provide addressId', 400);

		const order = await orderService.createOrder(
			req.user.id,
			addressId,
			items ?? null,
			promoCode ?? null,
			req.user.role
		);
		return successResponse(
			res,
			{ order },
			'Order created successfully',
			201
		);
	} catch (error) {
		return next(error);
	}
};

const getUserOrders = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const result = await orderService.getUserOrders(req.user.id, req.query);
		return successResponse(
			res,
			result,
			'User orders retrieved successfully'
		);
	} catch (error) {
		return next(error);
	}
};

const getOrderById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const order = await orderService.getOrderById(
			req.user.id,
			req.params.id as string
		);
		return successResponse(res, { order }, 'Order retrieved successfully');
	} catch (error) {
		return next(error);
	}
};

const getAllOrders = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const result = await orderService.getAllOrders(req.query);
		return successResponse(
			res,
			result,
			'All orders retrieved successfully'
		);
	} catch (error) {
		return next(error);
	}
};

const updateOrderStatus = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { status } = req.body as { status?: OrderStatus };
		if (!status) throw createError('Please provide status', 400);

		const order = await orderService.updateOrderStatus(
			req.params.id as string,
			status
		);
		return successResponse(
			res,
			{ order },
			'Order status updated successfully'
		);
	} catch (error) {
		return next(error);
	}
};

export default {
	createOrder,
	getUserOrders,
	getOrderById,
	getAllOrders,
	updateOrderStatus
};
