import { PrismaClient, Prisma } from '@prisma/client';
const PrismaClientInstance = new PrismaClient();

export default PrismaClientInstance;

export const PrismaErrorInstance = Prisma.PrismaClientKnownRequestError;
