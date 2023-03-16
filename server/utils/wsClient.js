import fastifyIO from 'fastify-socket.io';
import fastify from './fastifyClient.js';
import { jwt, store, createErrorPayload } from './index.js';

fastify.register(fastifyIO);

fastify.ready().then((fastify) => {
  try {
    const { io } = fastify;
    io.use(async (socket, next) => {
      const token = socket.request.headers?.authorization;
      const jwtVerify = jwt.verify(token);
      if (jwtVerify instanceof Error) {
        next(createErrorPayload(jwtVerify));
      }
      const { userId, sessionId } = jwt.decode(token);
      if (store.userToSessionDetails?.[userId]?.[sessionId]?.socketId) {
        next(new Error('already connected with same device'));
      }
      socket.on('disconnect', (reason) => {
        delete store.userToSessionDetails?.[userId]?.[sessionId].socketId;
      });
      socket.token = jwt.decode(token);
      socket.join(socket.token.userId);
      next(); // connection accepted
      socket.conn.on('packet', ({ type, data }) => {
        if (type !== 'pong') {
          const jwtVerify = jwt.verify(token);
          if (jwtVerify instanceof Error) {
            socket.emit('error', createErrorPayload(jwtVerify));
            socket.disconnect();
          }
        }
      });
      if (!store.userToSessionDetails?.[userId]) {
        store.userToSessionDetails[userId] = { [sessionId]: { socketId: socket.id } };
      } else if (!store.userToSessionDetails[userId]?.[sessionId]) {
        store.userToSessionDetails[userId][sessionId] = { socketId: socket.id };
      } else {
        store.userToSessionDetails[userId][sessionId].socketId = socket.id;
      }
      if (store.userToSessionDetails[userId][sessionId].chatIds?.length) {
        socket.emit('syncRecentUpdates', { chatIds: store.userToSessionDetails[userId][sessionId].chatIds });
        store.userToSessionDetails[userId][sessionId].chatIds = [];
      }
    });
  } catch (e) {
    console.log(e);
  }
});

export default fastify.io;
