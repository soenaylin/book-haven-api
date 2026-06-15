import type { PromoType, Role } from '@prisma/client';

import prisma from '../config/prisma.js';
import { createError } from '../utils/errors.js';

export type PromoInput = {
	code: string;
	description?: string | null;
	discount: number;
	type?: PromoType;
	minPurchase?: number;
	maxDiscount?: number | null;
	expiryDate?: string | Date | null;
	isActive?: boolean;
	oneTimePerUser?: boolean;
	usageLimit?: number | null;
};

class PromoCodeService {
	async validatePromoCode(
		code: string,
		subtotal: number,
		userId?: string,
		userRole: Role = 'USER'
	) {
		const promo = await prisma.promoCode.findFirst({
			where: { code, isActive: true }
		});

		if (!promo) throw createError('Invalid or inactive promo code', 404);

		if (promo.expiryDate && new Date() > promo.expiryDate) {
			throw createError('Promo code has expired', 400);
		}

		if (
			promo.usageLimit !== null &&
			promo.usageCount >= promo.usageLimit &&
			userRole !== 'ADMIN'
		) {
			throw createError('Promo code usage limit reached', 400);
		}

		if (subtotal < promo.minPurchase && userRole !== 'ADMIN') {
			throw createError(
				`Minimum purchase of ${promo.minPurchase} required for this code`,
				400
			);
		}

		let discountAmount =
			promo.type === 'PERCENTAGE'
				? (subtotal * promo.discount) / 100
				: promo.discount;
		if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
			discountAmount = promo.maxDiscount;
		}

		return {
			promoId: promo.id,
			code: promo.code,
			discountAmount: Math.min(discountAmount, subtotal),
			type: promo.type,
			discount: promo.discount,
			description: promo.description,
			minPurchase: promo.minPurchase,
			maxDiscount: promo.maxDiscount
		};
	}

	getAllPromoCodes() {
		return prisma.promoCode.findMany({
			orderBy: { createdAt: 'desc' }
		});
	}

	createPromoCode(data: PromoInput) {
		return prisma.promoCode.create({
			data: {
				...data,
				code: data.code.toUpperCase(),
				expiryDate: data.expiryDate
					? new Date(data.expiryDate)
					: undefined
			}
		});
	}

	updatePromoCode(id: string, data: Partial<PromoInput>) {
		return prisma.promoCode.update({
			where: { id },
			data: {
				...data,
				code: data.code?.toUpperCase(),
				expiryDate: data.expiryDate
					? new Date(data.expiryDate)
					: undefined
			}
		});
	}

	deletePromoCode(id: string) {
		return prisma.promoCode.delete({ where: { id } });
	}
}

export default new PromoCodeService();
