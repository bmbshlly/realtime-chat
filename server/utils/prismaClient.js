import { PrismaClient, Prisma } from '@prisma/client';
const PrismaClientInstance = new PrismaClient();

export default PrismaClientInstance;

PrismaClientInstance.$on('beforeExit', async () => {
  console.log('db disconnecting because process shutting down');
});

export const PrismaErrorInstance = Prisma.PrismaClientKnownRequestError;
