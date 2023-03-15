import fastifyClient from 'fastify';
import fastifyIO from 'fastify-socket.io';

const fastify = fastifyClient();

fastify.register(fastifyIO);

export default fastify;
