import { db, dbErrorInstance } from '../../utils/index.js';

const login = async (userName) => {
  return db.user.findUniqueOrThrow({ where: { userName } });
};

const search = async (userName) => {
  return db.user.findUniqueOrThrow({ where: { userName } });
};

const signup = async (userName) => {
  return db.user.create({ data: { userName } }).then(result => result).catch(e => {
    if (e instanceof dbErrorInstance && e.code) {
      e.msg = 'Username already exist';
    }
    throw e;
  });
};

export { login, signup, search };
