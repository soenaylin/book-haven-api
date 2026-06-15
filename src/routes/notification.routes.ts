import express from 'express';

import {
	deleteNotification,
	getNotifications,
	markAllAsRead,
	markAsRead
} from '../controllers/notification.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:notificationId/read', markAsRead);
router.delete('/:notificationId', deleteNotification);

export default router;
