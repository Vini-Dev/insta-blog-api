import { Document, model, Schema } from 'mongoose';
import { UserModelInterface } from './Users'

export interface PostModelInterface extends Document {
  description: string;
  image?: string;
  likes: Schema.Types.ObjectId[];
  created_at: string;
  created_by: UserModelInterface;
  updated_at: string;
  updated_by: UserModelInterface;
}

const PostsSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,    
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
  ],
  created_at: {
    type: Date,
    default: new Date(),
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  updated_at: {
    type: Date,
    default: new Date(),
  },
  updated_by: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
})

export default model<PostModelInterface>('Posts', PostsSchema)