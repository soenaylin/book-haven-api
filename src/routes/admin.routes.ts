import express from 'express';

import adminController from '../controllers/admin.controller.js';
import { authorize, protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/stats', adminController.getDashboardStats);
router.get('/finance', adminController.getFinancialStats);
router.get('/users', adminController.getAllUsers);

export default router;
