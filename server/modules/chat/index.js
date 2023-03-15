import { db } from '../../utils/index.js';

const findOrCreate = async (members) => {
  return db.chat.upsert({
    where: { members },
    update: {},
    create: { members }
  });
};

export { findOrCreate };
