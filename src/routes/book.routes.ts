import express from 'express';

import bookController from '../controllers/book.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', bookController.getAllBooks);
router.get('/categories', bookController.getAllCategories);

router.post(
	'/categories',
	protect,
	authorize('ADMIN'),
	bookController.createCategory
);
router.put(
	'/categories/:id',
	protect,
	authorize('ADMIN'),
	bookController.updateCategory
);
router.delete(
	'/categories/:id',
	protect,
	authorize('ADMIN'),
	bookController.deleteCategory
);

router.get('/:id', bookController.getBookById);
router.post('/', protect, authorize('ADMIN'), bookController.createBook);
router.put('/:id', protect, authorize('ADMIN'), bookController.updateBook);
router.delete('/:id', protect, authorize('ADMIN'), bookController.deleteBook);

export default router;
