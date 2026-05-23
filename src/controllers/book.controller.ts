import type { NextFunction, Request, Response } from 'express';

import bookService from '../services/book.service.js';
import type { Book, Category } from '../types/index.js';
import { successResponse } from '../utils/response.js';

const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = await bookService.getAllBooks(req.query);
		return successResponse(res, result, 'Books retrieved successfully');
	} catch (error) {
		return next(error);
	}
};

const getBookById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const book = await bookService.getBookById(req.params.id as string);
		return successResponse(res, { book }, 'Book retrieved successfully');
	} catch (error) {
		return next(error);
	}
};

const createBook = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const book = await bookService.createBook(req.body as Book);
		return successResponse(res, { book }, 'Book created successfully', 201);
	} catch (error) {
		return next(error);
	}
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const book = await bookService.updateBook(
			req.params.id as string,
			req.body as Partial<Book>
		);
		return successResponse(res, { book }, 'Book updated successfully');
	} catch (error) {
		return next(error);
	}
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await bookService.deleteBook(req.params.id as string);
		return successResponse(res, null, 'Book deleted successfully');
	} catch (error) {
		return next(error);
	}
};

const getAllCategories = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const result = await bookService.getAllCategories(req.query);
		return successResponse(
			res,
			result,
			'Categories retrieved successfully'
		);
	} catch (error) {
		return next(error);
	}
};

const createCategory = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const category = await bookService.createCategory(req.body as Category);
		return successResponse(
			res,
			{ category },
			'Category created successfully',
			201
		);
	} catch (error) {
		return next(error);
	}
};

const updateCategory = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const category = await bookService.updateCategory(
			req.params.id as string,
			req.body as Partial<Category>
		);
		return successResponse(
			res,
			{ category },
			'Category updated successfully'
		);
	} catch (error) {
		return next(error);
	}
};

const deleteCategory = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await bookService.deleteCategory(req.params.id as string);
		return successResponse(res, null, 'Category deleted successfully');
	} catch (error) {
		return next(error);
	}
};

export default {
	getAllBooks,
	getBookById,
	createBook,
	updateBook,
	deleteBook,
	getAllCategories,
	createCategory,
	updateCategory,
	deleteCategory
};
