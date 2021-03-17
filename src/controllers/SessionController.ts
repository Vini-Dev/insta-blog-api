import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Users from '../models/Users';
import { Request, Response } from 'express';

/**
 * Login
 */
 interface StoreRequestInterface extends Request {
  body: {
    user: string;
    password: string;
  },
}

const { JWT_SESSION_KEY, JWT_SESSION_LIFETIME, FILES_URL } = process.env

const store = async (
  request: StoreRequestInterface,
  response: Response
): Promise<Response> => {
  
  const { user, password } = request.body

  try {
    const requestedUser = await Users.findOne({ user }).select('+password')

    if(requestedUser === null)
      return response.status(404).send();  

    // Verify if passwords is equal
    const isEqual = await bcrypt.compare(password, requestedUser.password)

    if(!isEqual)
      return response.status(400).json({ message: 'Invalid credentials!' });  

    // Creating the token 
    const token = 'Bearer ' + jwt.sign({ id: requestedUser._id }, JWT_SESSION_KEY, {
        expiresIn: JWT_SESSION_LIFETIME
      });

    // Remove the password from user data
    const dataUser =  requestedUser.toObject()
    delete dataUser.password
    
    if(dataUser?.avatar) {
      dataUser['avatar_url'] = FILES_URL + "/" + dataUser.avatar;
    }
  
    return response.status(200).json({ token, user: dataUser });
  } catch (error) {
  
    return response.status(500).json(error);
  }
};

export default {
  store,
};