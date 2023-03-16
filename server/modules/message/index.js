import { db } from '../../utils/index.js';

const send = async ({ senderUserId, chatId, text }) => {
  const checkChatPermission = db.chat.findFirstOrThrow({
    where: {
      chatId,
      members: { hasEvery: [senderUserId] }
    }
  });

  const createMessage = db.message.create({
    data: {
      senderUserId,
      chatId,
      text
    },
    include: { chat: true }
  });

  const [, { chat, ...messageResponse }
  ] = await db.$transaction([
    checkChatPermission,
    createMessage
  ]);

  return {
    chat,
    messageResponse
  };
};

const get = async ({ senderUserId, chatIds, lastSyncTime, limit = 100, cursor }) => {
  cursor = cursor || lastSyncTime;
  if (cursor && lastSyncTime && new Date(lastSyncTime) > new Date(cursor)) {
    cursor = lastSyncTime;
  };
  const result = await db.message.findMany({
    where: {
      NOT: { senderUserId: { equals: senderUserId } },
      chatId: { in: chatIds },
      createdAt: { gt: cursor }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
  return result;
};

export { send, get };
