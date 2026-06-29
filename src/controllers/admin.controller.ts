import type { Prisma } from '@prisma/client';
import { OrderStatus } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

import prisma from '../config/prisma.js';
import { toPositiveInt } from '../utils/errors';
import { successResponse } from '../utils/response.js';

const getDashboardStats = async (
	_req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const [
			totalBooks,
			totalOrders,
			totalUsers,
			totalRevenue,
			bestSellers,
			totalCategories,
			recentOrders
		] = await Promise.all([
			prisma.book.count(),
			prisma.order.count(),
			prisma.user.count(),
			prisma.order.aggregate({
				where: {
					status: {
						not: OrderStatus.CANCELLED
					}
				},
				_sum: {
					totalPrice: true
				}
			}) ?? 0,
			prisma.book.findMany({
				take: 5,
				orderBy: { salesCount: 'desc' },
				include: { category: true }
			}),
			prisma.category.count(),
			prisma.order.findMany({
				take: 5,
				orderBy: { createdAt: 'desc' },
				include: {
					user: {
						select: {
							name: true,
							email: true
						}
					}
				}
			})
		]);

		return successResponse(
			res,
			{
				stats: {
					totalBooks,
					totalOrders,
					totalUsers,
					totalRevenue: totalRevenue._sum.totalPrice || 0,
					recentOrders,
					bestSellers,
					totalCategories
				}
			},
			'Dashboard stats retrieved successfully'
		);
	} catch (error) {
		next(error);
	}
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const page = toPositiveInt(req.query.page, 1);
		const limit = toPositiveInt(req.query.limit, 10, 50);
		const search =
			typeof req.query.search === 'string' ? req.query.search : '';

		const where: Prisma.UserWhereInput = search
			? {
					OR: [
						{ name: { contains: search } },
						{ email: { contains: search } }
					]
				}
			: {};

		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					createdAt: true
				},
				orderBy: { createdAt: 'desc' },
				skip: (page - 1) * limit,
				take: limit
			}),
			prisma.user.count({ where })
		]);

		return successResponse(
			res,
			{
				users,
				pagination: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit)
				}
			},
			'Users retrieved successfully'
		);
	} catch (error) {
		next(error);
	}
};

const getFinancialStats = async (
	_req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const [dailyRevenue, orderItems, books, promoUsage, orderAggregation] =
			await Promise.all([
				prisma.order.findMany({
					where: { createdAt: { gte: thirtyDaysAgo } },
					select: { createdAt: true, totalPrice: true },
					orderBy: { createdAt: 'asc' }
				}),
				prisma.orderItem.findMany({
					include: { book: { include: { category: true } } }
				}),
				prisma.book.findMany({
					select: {
						price: true,
						stock: true
					}
				}),
				prisma.promoCode.findMany({
					select: {
						code: true,
						usageCount: true,
						discount: true,
						type: true
					},
					orderBy: { usageCount: 'desc' },
					take: 5
				}),
				prisma.order.aggregate({
					_avg: { totalPrice: true },
					_count: { id: true }
				})
			]);

		const revenueByDayMap = new Map<string, number>();
		dailyRevenue.forEach((order) => {
			const date = order.createdAt?.toISOString().split('T')[0] ?? '';
			revenueByDayMap.set(
				date,
				(revenueByDayMap.get(date) ?? 0) + order.totalPrice
			);
		});

		const categoryRevenueMap = new Map<string, number>();
		orderItems.forEach((item) => {
			const categoryName = item.book.category?.name;
			categoryRevenueMap.set(
				categoryName,
				(categoryRevenueMap.get(categoryName) ?? 0) +
					item.price * item.quantity
			);
		});

		return successResponse(
			res,
			{
				stats: {
					revenueByDay: Array.from(
						revenueByDayMap,
						([date, revenue]) => ({ date, revenue })
					),
					revenueByCategory: Array.from(
						categoryRevenueMap,
						([name, value]) => ({ name, value })
					),
					inventoryValue: books.reduce(
						(sum, book) => sum + book.price * book.stock,
						0
					),
					promoUsage,
					averageOrderValue: orderAggregation._avg.totalPrice || 0,
					totalOrders: orderAggregation._count.id
				}
			},
			'Financial stats retrieved successfully'
		);
	} catch (error) {
		next(error);
	}
};

export default { getDashboardStats, getAllUsers, getFinancialStats };
