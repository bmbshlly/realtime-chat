import { User, Message, Chat } from './modules/index.js';
import { jwt, server, store, createErrorPayload } from './utils/index.js';
server.ready().then(() => {
  try {
    const { io } = server;
    io.on('connection', async (socket) => {
      const token = socket.request.headers?.authorization;
      if (!jwt.verify(token)) {
        io.emit('channel', createErrorPayload({ msg: 'invalid token' }));
        return socket.disconnect();
      }
      const { userId, sessionId } = jwt.decode(token);
      if (store.sessionToSocket[sessionId]) {
        io.emit('channel', createErrorPayload({ msg: 'already connected with same device' }));
        return socket.disconnect();
      }
      store.sessionToSocket[sessionId] = socket.id;
      if (store.userToSession[userId]?.size) {
        store.userToSession[userId].add(sessionId);
      } else {
        store.userToSession[userId] = new Set(sessionId);
      }
      io.to(socket.id).emit('channel', 'good');
      socket.on('channel', (arg) => {
        console.log(arg);
      });
    });
  } catch (e) {
    console.log('e');
  }
});

const ignorePaths = new Set(['test', 'login', 'signup']);

server.addHook('preHandler', function (req, reply, done) {
  try {
    if (!ignorePaths.has(req.url.slice(1))) {
      const token = req.headers.authorization?.split(' ')?.[1];
      if (!jwt.verify(token)) {
        reply.code(401).send({ msg: 'token expired' });
      };
      req.token = jwt.decode(token);
    };
    done();
  } catch (e) {
    return reply.code(400).send(createErrorPayload(e));
  }
});

server.post('/login', async function (req, reply) {
  try {
    const result = await User.login(req.body.userName);
    return { token: jwt.sign(result) };
  } catch (e) {
    return reply.code(400).send(createErrorPayload(e));
  }
});

server.post('/signup', async function (req, reply) {
  try {
    const result = await User.signup(req.body.userName);
    return result;
  } catch (e) {
    return reply.code(400).send(createErrorPayload(e));
  }
});

server.post('/search-chat', async function (req, reply) {
  try {
    const { userId } = await User.search(req.body.userName);
    return Chat.findOrCreate([userId, req.token.userId].sort());
  } catch (e) {
    return reply.code(400).send(createErrorPayload(e));
  }
});

server.post('/message', async function (req, reply) {
  try {
    const { chatId, text } = req.body;
    const result = await Message.send({ senderId: req.token.userId, chatId, text });
    return result;
  } catch (e) {
    return reply.code(400).send(createErrorPayload(e));
  }
});

server.listen({ port: process.env.port }, err => {
  if (err) {
    // server.log.error(err);
    process.exit(1);
  }
  console.log('server started');
});
