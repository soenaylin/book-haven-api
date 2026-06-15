import type { NextFunction, Request, Response } from 'express';

import addressService from '../services/address.service';
import type { AddressInput } from '../services/address.service';
import { createError } from '../utils/errors';
import { successResponse } from '../utils/response';

const createAddress = async (
	req: Request<unknown, unknown, AddressInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const { fullName, phone, addressLine, city, country } = req.body;
		if (!fullName || !phone || !addressLine || !city || !country) {
			throw createError('Please provide all required fields', 400);
		}

		const address = await addressService.createAddress(req.user.id, {
			fullName,
			phone,
			addressLine,
			city,
			country
		});

		return successResponse(
			res,
			{ address },
			'Address created successfully',
			201
		);
	} catch (error) {
		next(error);
	}
};

const getUserAddresses = async (
	req: Request<unknown, unknown, unknown, { page?: string; limit?: string }>,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);

		const addresses = await addressService.getUserAddresses(req.user.id);

		return successResponse(
			res,
			{ addresses },
			'User addresses retrieved successfully',
			200
		);
	} catch (error) {
		next(error);
	}
};

export default { createAddress, getUserAddresses };
