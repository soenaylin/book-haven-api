import prisma from '../config/prisma.js';
import { createError } from '../utils/errors.js';

type NotificationInput = {
	userId: string;
	title: string;
	message: string;
	type: string;
	link?: string | null;
};

type AdminNotificationInput = Omit<NotificationInput, 'userId'>;

class NotificationService {
	getNotifications(userId: string) {
		return prisma.notification.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			take: 25
		});
	}

	async createNotification(input: NotificationInput) {
		const notification = await prisma.notification.create({
			data: input
		});
		return notification;
	}

	async markAsRead(notificationId: string, userId: string) {
		const notification = await prisma.notification.findUnique({
			where: { id: notificationId }
		});

		if (!notification || notification.userId !== userId) {
			throw createError('Notification not found', 404);
		}

		return prisma.notification.update({
			where: { id: notificationId },
			data: { read: true }
		});
	}

	markAllAsRead(userId: string) {
		return prisma.notification.updateMany({
			where: { userId, read: false },
			data: { read: true }
		});
	}

	async deleteNotification(notificationId: string, userId: string) {
		const notification = await prisma.notification.findUnique({
			where: { id: notificationId }
		});

		if (!notification || notification.userId !== userId) {
			throw createError('Notification not found', 404);
		}

		return prisma.notification.delete({
			where: { id: notificationId }
		});
	}

	async notifyAdmins(input: AdminNotificationInput) {
		const admins = await prisma.user.findMany({
			where: { role: 'ADMIN' },
			select: { id: true }
		});

		return Promise.all(
			admins.map((admin) =>
				this.createNotification({
					...input,
					userId: admin.id
				})
			)
		);
	}
}

export default new NotificationService();
