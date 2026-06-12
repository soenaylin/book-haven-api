import type { Request, Response, NextFunction } from 'express';
import notificationService from '../services/notification.service.js';
import { createError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';

export const getNotifications = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const notifications = await notificationService.getNotifications(
			req.user.id
		);

		return successResponse(
			res,
			{ notifications },
			'Notifications fetched successfully'
		);
	} catch (error) {
		return next(error);
	}
};

export const markAsRead = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		const notification = await notificationService.markAsRead(
			req.params.notificationId as string,
			req.user.id
		);
		return successResponse(
			res,
			{ notification },
			'Notification marked as read'
		);
	} catch (error) {
		return next(error);
	}
};

export const markAllAsRead = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		await notificationService.markAllAsRead(req.user.id);
		return successResponse(res, null, 'All notifications marked as read');
	} catch (error) {
		return next(error);
	}
};

export const deleteNotification = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) throw createError('Not authorized', 401);
		await notificationService.deleteNotification(
			req.params.notificationId as string,
			req.user.id
		);
		return successResponse(res, null, 'Notification deleted successfully');
	} catch (error) {
		return next(error);
	}
};
