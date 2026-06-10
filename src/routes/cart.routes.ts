import express from 'express';

import cartController from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItemToCart);
router.put('/items/:id', cartController.updateItemQuantity);
router.delete('/items/:id', cartController.removeItemFromCart);

export default router;
