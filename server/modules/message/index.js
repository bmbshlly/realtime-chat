import { db } from '../../utils/index.js';

const send = async ({ senderId, chatId, text }) => {
  return db.message.create({ data: { senderId, chatId, text } });
};

export { send };
