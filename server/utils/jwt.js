import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

const jwtSecret = process.env.jwtSecret;

const sign = (payload) => {
  return jwt.sign({ ...payload, sessionId: uuid() }, jwtSecret, { expiresIn: '1d' });
};

const decode = (token) => {
  return jwt.decode(token);
};

const verify = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (e) {
    return false;
  }
};

export { sign, verify, decode };
