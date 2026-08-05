import express from 'express';

import {
	createReview,
	deleteReview,
	getBookReviews
} from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/book/:bookId', getBookReviews);
router.post('/book/:bookId', protect, createReview);
router.delete('/:reviewId', protect, deleteReview);

export default router;
