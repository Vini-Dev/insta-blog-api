import Users from '../models/Users';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt'
import fs from 'fs'
import jwt from 'jsonwebtoken';

const { JWT_SESSION_KEY, JWT_SESSION_LIFETIME } = process.env

/**
 * Return post by id
 */
interface IndexRequestInterface extends Request {
  body: {
    session: {
      id: string;
    }
  },
}

const index = async (
  request: IndexRequestInterface,
  response: Response
): Promise<Response> => {
  try {
    const { session } = request.body

    const user = await Users.findById(session.id)

    return response.status(200).json(user);
  } catch (error) {
  
    return response.status(500).json(error);
  }
};

/**
 * List all users not id logged
 */
interface ListRequestInterface extends Request {
  body: {
    session: {
      id: string;
    }
  },
}

const list = async (
  request: ListRequestInterface,
  response: Response
): Promise<Response> => {
  try {
    const { session } = request.body;

    const users = await Users.find({ _id: { $ne: session.id } })
    
    return response.status(200).json(users);
  } catch (error) {
    return response.status(500).json(error);
  }
};

/**
 * Store a new post
 */
interface StoreRequestInterface extends Request {
  body: {
    name: string,
    user: string,
    biography?: string,
    password: string,
    password_confirmation: string,
  },
}

const store = async (
  request: StoreRequestInterface,
  response: Response
): Promise<Response> => {
  try {
    const { name, user, biography = '', password, password_confirmation } = request.body

    const userIsAvailable = await Users.findOne({ user })

    if(userIsAvailable) {
      return response.status(422).json([
        { 
          field: 'user',
          message: 'User already used' 
        }
      ]);
    }

    if(password !== password_confirmation) {
      return response.status(422).json([
        {       
          field: 'password_confirmation',    
          message: 'Passwords must match' 
        }
      ]);
    }

    const hash = await bcrypt.hash(password, 8)

    const newUser = await Users.create({
      name,
      user,
      biography,
      password: hash,      
    })

    delete newUser.password

    // Creating the token 
    const token = 'Bearer ' + jwt.sign({ id: newUser._id }, JWT_SESSION_KEY, {
      expiresIn: JWT_SESSION_LIFETIME
    });
    
    return response.status(201).json({ token, user: newUser });
  } catch (error) {
    return response.status(500).json(error);
  }
};

/**
 * Update user by id
 */
 interface UpdateRequestInterface extends Request {
  params: {
    id: string;
  };
  body: {
    session: {
      id: string;
    },    
    name: string,    
    biography: string,    
  };
}

const update = async (
  request: UpdateRequestInterface,
  response: Response
): Promise<Response> => {
  try {
    const { session, name, biography } = request.body

    const user = await Users.findByIdAndUpdate(session.id, {
      name,      
      biography,      
    }, { new: true })
    
    return response.status(200).json(user);
  } catch (error) {
    return response.status(500).json(error);
  }
};

/**
 * Delete user by id
 */
 interface DestroyRequestInterface extends Request {
  body: {
    session: {
      id: string;
    }
  },
}

const destroy = async (
  request: DestroyRequestInterface,
  response: Response
): Promise<Response> => {
  try {
    const { session } = request.body

    const result = await Users.findByIdAndDelete(session.id)

    if(!result)
      return response.status(404).send();;  

    return response.status(200).json({});
  } catch (error) {
  
    return response.status(500).json(error);
  }
};

/**
 * Update avatar user
 */
interface AvatarUpdateRequestInterface extends Request {
  body: {
    session: {
      id: string;
    },
  };
  file: {
    path: string;
  };
}
const avatarUpdate = async (
  request: AvatarUpdateRequestInterface,
  response: Response
): Promise<Response> => {
  try {
 
    const { body, file } = request;
    const { session } = body;

    const user = await Users.findById(session.id)
    if (user.avatar) {
      fs.unlinkSync(user.avatar)
    }

    const updatedUser = await Users.findByIdAndUpdate(session.id, {
      avatar: file.path,      
    }, { new: true })
    
    return response.status(200).json(updatedUser);
  } catch (error) {    
    console.log(error)
    return response.status(500).json(error);
  }
};

export default  {
  index,
  list,
  store,
  update,
  destroy,
  avatarUpdate,
};