import type { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

import prisma from '../config/prisma.js';
import { createError } from '../utils/errors.js';

type UpdateProfileInput = {
	name?: string;
	email?: string;
	password?: string;
};

class AuthService {
	async register(name: string, email: string, password: string) {
		const userExists = await prisma.user.findUnique({ where: { email } });
		if (userExists) throw createError('User already exists', 400);

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: 'USER'
				// cart: { create: {} }
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true
			}
		});

		return {
			user,
			token: this.generateToken(user.id, user.role)
		};
	}

	async login(email: string, password: string) {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) throw createError('Invalid email or password', 401);

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) throw createError('Invalid email or password', 401);

		const { password: _password, ...userWithoutPassword } = user;
		return {
			user: userWithoutPassword,
			token: this.generateToken(user.id, user.role)
		};
	}

	async updateProfile(userId: string, data: UpdateProfileInput) {
		const updateData: UpdateProfileInput = {};

		if (data.name) updateData.name = data.name;

		if (data.email) {
			const existingUser = await prisma.user.findUnique({
				where: { email: data.email }
			});
			if (existingUser && existingUser.id !== userId) {
				throw createError('Email already in use', 400);
			}
			updateData.email = data.email;
		}

		if (data.password) {
			updateData.password = await bcrypt.hash(data.password, 10);
		}

		return prisma.user.update({
			where: { id: userId },
			data: updateData,
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true
			}
		});
	}

	generateToken(id: string, role: Role) {
		const expiresIn = (process.env.JWT_EXPIRES_IN ||
			'7d') as SignOptions['expiresIn'];

		return jwt.sign({ id, role }, process.env.JWT_SECRET || 'dev-secret', {
			expiresIn
		});
	}
}

export default new AuthService();
