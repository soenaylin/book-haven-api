import express from 'express';

import recentlyViewedController from '../controllers/recentlyViewed.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', recentlyViewedController.getRecentlyViewed);
router.post('/', recentlyViewedController.trackView);
router.delete('/', recentlyViewedController.clearRecentlyViewed);

export default router;
