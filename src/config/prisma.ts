import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';

// Pass the config object directly to the adapter instead of a pre-created client instance
const adapter = new PrismaLibSql({
	url: process.env.DATABASE_URL ?? 'file:./dev.db'
});

interface GlobalWithPrisma {
	prisma?: PrismaClient;
}

const globalForPrisma = globalThis as GlobalWithPrisma;

const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log:
			process.env.NODE_ENV === 'development'
				? ['query', 'error', 'warn']
				: ['error']
	});

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}

export default prisma;
