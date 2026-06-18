import express from 'express';

import orderController from '../controllers/order.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', orderController.createOrder);
router.get('/admin/all', authorize('ADMIN'), orderController.getAllOrders);
router.patch(
	'/:id/status',
	authorize('ADMIN'),
	orderController.updateOrderStatus
);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);

export default router;
