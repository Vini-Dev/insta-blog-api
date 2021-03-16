import Posts from '../models/Posts';
import fs from 'fs'
import { Request, Response } from 'express';

const { FILES_URL } = process.env

/**
 * Return post by id
 */
 interface IndexRequestInterface extends Request {
  params: {
    id: string;
  },
}
const index = async (
  request: IndexRequestInterface,
  response: Response
): Promise<Response> => {
  
  const { id } = request.params

  try {
    const row = await Posts.findById(id).populate('created_by')

    if(!row) {
      return response.status(404).send();
    }

    const post = row.toObject()
    
    if(post.image) {
      post['image_url'] = FILES_URL + "/" + post.image;
    }

    if(post.created_by?.avatar) {
      post.created_by['avatar_url'] = FILES_URL + "/" + post.created_by.avatar;
    }

    return response.status(200).json(post);
  } catch (error) {
  
    return response.status(500).json(error);
  }
};

/**
 * List all posts
 */
interface ListRequestInterface extends Request {
  query: {
    myLikes?: 'true';
  };
  body: {
    session: {
      id: string;
    };
  };
}
const list = async (
  request: ListRequestInterface,
  response: Response
): Promise<Response> => {
  try {
    const { myLikes } = request.query
    const { session } = request.body

    const query = {};

    if(myLikes === 'true') {
      query['likes'] = session.id;
    }

    const rows = await Posts.find(query).sort({ created_at: -1 }).populate('created_by')

    const posts = rows.map(row => {
      const post = row.toObject()

      if(post.image) {
        post['avatar_url'] = FILES_URL + "/" + post.image;
      }
      
      if(post.created_by?.avatar) {
        post.created_by['avatar_url'] = FILES_URL + "/" + post.created_by.avatar;
      }
      return post
    })
    
    
    return response.status(200).json(posts);
  } catch (error) {    
    return response.status(500).json(error);
  }
};

/**
 * Store a new post
 */
interface StoreRequestInterface extends Request {
  body: {
    session: {
      created_by: string;
      updated_by: string;
    };
    description: string,    
  },
}

const store = async (
  request: StoreRequestInterface,
  response: Response
): Promise<Response> => {
  try {
    const { session, description  } = request.body
    const { created_by, updated_by } = session

    const post = await Posts.create({
      description,
      created_by,
      updated_by,
    })
    
    return response.status(201).json(post);
  } catch (error) {
    return response.status(500).json(error);
  }
};

/**
 * Delete post by id
 */
interface DestroyRequestInterface extends Request {
  params: {
    id: string;
  },
}
const destroy = async (
  request: DestroyRequestInterface,
  response: Response
): Promise<Response> => {
  
  const { id } = request.params

  try {
    const result = await Posts.findByIdAndDelete(id)

    if(!result)
      return response.status(404).send();  

    return response.status(200).json({});
  } catch (error) {
  
    return response.status(500).json(error);
  }
};

/**
 * Like post
 */
interface LikeRequestInterface extends Request {
  body: {
    session: {
      id: string;
    };
  }
  params: {
    id: string;
  },
}
const like = async (
  request: LikeRequestInterface,
  response: Response
): Promise<Response> => {
  
  const { session } = request.body
  const { id } = request.params

  try {
    const result = await Posts.findByIdAndUpdate({ _id: id }, { $push: { likes: session.id } })

    if(!result)
      return response.status(404).send();  

    return response.status(200).json({});
  } catch (error) {
  
    return response.status(500).json(error);
  }
};

/**
 * Unlike post
 */
 interface UnlikeRequestInterface extends Request {
  body: {
    session: {
      id: string;
    };
  }
  params: {
    id: string;
  },
}
const unlike = async (
  request: UnlikeRequestInterface,
  response: Response
): Promise<Response> => {
  
  const { session } = request.body
  const { id } = request.params

  try {
    const result = await Posts.findByIdAndUpdate({ _id: id }, { $pull: { likes: session.id } })

    if(!result)
      return response.status(404).send();  

    return response.status(200).json({});
  } catch (error) {
  
    return response.status(500).json(error);
  }
};


/**
 * Update avatar user
 */
 interface ImageUpdateRequestInterface extends Request {
  params: {
    id: string;
  };
  file: {
    filename: string;
  };
}
const imageUpdate = async (
  request: ImageUpdateRequestInterface,
  response: Response
): Promise<Response> => {
  try {
    const { params, file } = request;
    const { id } = params;

    const post = await Posts.findById(id)
    if (post.image) {
      fs.unlinkSync(post.image)
    }

    const updatedPost = await Posts.findByIdAndUpdate(id, {
      image: file.filename,      
    }, { new: true })
    
    return response.status(200).json({
      ...updatedPost
    });
  } catch (error) {    
    console.log(error)
    return response.status(500).json(error)
  }
}

export default  {
  index,
  list,
  store,
  destroy,
  like,
  unlike,
  imageUpdate,
};