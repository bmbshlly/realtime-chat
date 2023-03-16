import { User, Message, Chat } from './modules/index.js';
import { jwt, server, createErrorPayload } from './utils/index.js';

const ignorePaths = new Set(['test', 'login', 'signup']);

server.ready().then((server) => {
  try {
    const { io } = server;
    io.on('connection', async (socket) => {
      socket.on('sendMessage', async (payload) => {
        try {
          const { chatId, text } = payload;
          const senderUserId = socket.token.userId;
          const { chat, messageResponse } = await Message.send({ senderUserId, chatId, text });
          io.in(chat.members).emit('getMessage', messageResponse);
        } catch (e) {
          socket.emit('sendMessage', createErrorPayload(e));
        }
      });

      socket.on('getMessage', async (payload) => {
        try {
          const { chatIds, lastSyncTime, limit, cursor, ignoreSent } = payload;
          const result = await Message.get({ senderUserId: ignoreSent && socket.token.userId, chatIds, lastSyncTime, limit, cursor });
          socket.emit('getMessage', result);
        } catch (e) {
          socket.emit('getMessage', createErrorPayload(e));
        }
      });
    });
  } catch (e) {
    console.log(e);
  }
});

server.addHook('preHandler', function (req, reply, done) {
  try {
    if (!ignorePaths.has(req.url.slice(1))) {
      const token = req.headers.authorization?.split(' ')?.[1];
      const jwtVerify = jwt.verify(token);
      if (jwtVerify instanceof Error) {
        reply.code(401).send(createErrorPayload(jwtVerify));
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
    const { messageResponse } = await Message.send({ senderUserId: req.token.userId, chatId, text });
    return messageResponse;
  } catch (e) {
    return reply.code(400).send(createErrorPayload(e));
  }
});

server.listen({ port: process.env.PORT || 3000 }, err => {
  if (err) {
    // server.log.error(err);
    process.exit(1);
  }
  console.log('server started');
});
