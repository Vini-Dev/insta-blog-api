import jwt from 'jsonwebtoken';
import { promisify } from 'util';

const { JWT_SESSION_KEY } = process.env

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  
  if (!authHeader) {
    return res.status(400).json({ message: 'Token not provided' });
  }
  
  const [, token] = authHeader.split(' ');
  try {
    
    const tokenDecoded = await promisify(jwt.verify)(token, JWT_SESSION_KEY);
    
    if (!tokenDecoded) {
      return res.status(401).json({ message: 'Decoded token error' });
    }

    req.body = {
      ...req.body,
      session: {
        id: tokenDecoded.id,
        created_by: tokenDecoded.id,
        updated_by: tokenDecoded.id,
      },
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid' });
  }
};