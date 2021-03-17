import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { promisify } from 'util';

const { JWT_SESSION_KEY } = process.env

export default async (request: Request, response: Response, next: NextFunction) => {
  const authHeader = request.headers.authorization;

  
  if (!authHeader) {
    return response.status(400).json({ message: 'Token not provided' });
  }
  
  const [, token] = authHeader.split(' ');
  try {
    
    const tokenDecoded = await promisify(jwt.verify)(token, JWT_SESSION_KEY);
    
    if (!tokenDecoded) {
      return response.status(401).json({ message: 'Decoded token error' });
    }

    request.body = {
      ...request.body,
      session: {
        id: tokenDecoded.id,
        created_by: tokenDecoded.id,
        updated_by: tokenDecoded.id,
      },
    };

    return next();
  } catch (error) {
    return response.status(401).json({ message: 'Token invalid' });
  }
};