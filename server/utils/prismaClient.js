import { PrismaClient, Prisma } from '@prisma/client';
const PrismaClientInstance = new PrismaClient({
  // log: [
  //   {
  //     emit: 'event',
  //     level: 'query'
  //   }
  // ]
});

export default PrismaClientInstance;

PrismaClientInstance.$on('beforeExit', async () => {
  console.log('db disconnecting because process shutting down');
});

PrismaClientInstance.$on('query', (e) => {
  // console.log('Query: ' + e.query);
  // console.log('Params: ' + e.params);
  console.log('Duration: ' + e.duration + 'ms');
});

export const PrismaErrorInstance = Prisma.PrismaClientKnownRequestError;
