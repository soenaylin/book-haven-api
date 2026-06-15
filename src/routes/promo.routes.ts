import express from 'express';

import promoController from '../controllers/promo.controller';
import { authorize, protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/validate', promoController.validatePromoCode);
router.get('/', authorize('ADMIN'), promoController.getAllPromoCodes);
router.post('/', authorize('ADMIN'), promoController.createPromoCode);
router.patch('/:id', authorize('ADMIN'), promoController.updatePromoCode);
router.delete('/:id', authorize('ADMIN'), promoController.deletePromoCode);

export default router;
