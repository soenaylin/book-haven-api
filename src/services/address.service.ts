import prisma from '../config/prisma.js';
import { createError } from '../utils/errors.js';

export type AddressInput = {
	fullName: string;
	phone: string;
	addressLine: string;
	city: string;
	country: string;
};

class AddressService {
	createAddress(userId: string, addressData: AddressInput) {
		return prisma.address.create({
			data: {
				...addressData,
				userId
			}
		});
	}

	getUserAddresses(userId: string) {
		return prisma.address.findMany({
			where: { userId },
			orderBy: { id: 'desc' }
		});
	}

	async getAddressById(userId: string, addressId: string) {
		const address = await prisma.address.findFirst({
			where: { id: addressId, userId }
		});

		if (!address) {
			throw createError('Address not found', 404);
		}

		return address;
	}
}

export default new AddressService();
