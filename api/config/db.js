import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const connectDB = async () => {
	try {
		await prisma.$connect();
		console.log('Prisma connected to PostgreSQL');
	} catch (error) {
		console.error('Error connecting to PostgreSQL:', error);
		process.exit(1);
	}
};

export default prisma;
