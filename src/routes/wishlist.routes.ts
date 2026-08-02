import express from 'express';

import wishlistController from '../controllers/wishlist.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.get('/check/:bookId', wishlistController.checkInWishlist);
router.delete('/:bookId', wishlistController.removeFromWishlist);

export default router;
