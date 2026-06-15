import type { NextFunction, Request, Response } from 'express';

import promoService from '../services/promo.service';
import type { PromoInput } from '../services/promo.service';
import { createError } from '../utils/errors.js';
import { successResponse } from '../utils/response';

type ValidatePromoCodeRequest = Request & {
	body: {
		code: string;
		subtotal: number;
	};
};

const validatePromoCode = async (
	req: ValidatePromoCodeRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { code, subtotal } = req.body as {
			code: string;
			subtotal: number;
		};
		if (!code || subtotal === undefined)
			throw createError('Please provide code and subtotal', 400);

		const result = await promoService.validatePromoCode(
			code,
			Number(subtotal),
			req.user?.id,
			req.user?.role
		);

		return successResponse(res, result, 'Promo code is valid');
	} catch (error) {
		return next(error);
	}
};

const getAllPromoCodes = async (
	_req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const promoCodes = await promoService.getAllPromoCodes();
		return successResponse(
			res,
			{ promoCodes },
			'Promo codes retrieved successfully'
		);
	} catch (error) {
		return next(error);
	}
};

const createPromoCode = async (
	req: Request<unknown, unknown, PromoInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const promoCode = await promoService.createPromoCode(req.body);
		return successResponse(
			res,
			{ promoCode },
			'Promo code created successfully',
			201
		);
	} catch (error) {
		return next(error);
	}
};

const updatePromoCode = async (
	req: Request<{ id: string }, unknown, PromoInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const promoCode = await promoService.updatePromoCode(
			req.params.id,
			req.body
		);
		return successResponse(
			res,
			{ promoCode },
			'Promo code updated successfully'
		);
	} catch (error) {
		return next(error);
	}
};

const deletePromoCode = async (
	req: Request & { params: { id: string } },
	res: Response,
	next: NextFunction
) => {
	try {
		await promoService.deletePromoCode(req.params.id);
		return successResponse(res, null, 'Promo code deleted successfully');
	} catch (error) {
		return next(error);
	}
};

export default {
	validatePromoCode,
	getAllPromoCodes,
	createPromoCode,
	updatePromoCode,
	deletePromoCode
};
