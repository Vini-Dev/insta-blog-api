import { Document, model, Schema } from 'mongoose';

export interface UserModelInterface extends Document {
  name: string;
  user: string;
  biography: string;
  password: string;
  created_at: string;
  updated_at: string;
}

const UsersSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    unique: true,
    required: true,
  },
  biography: String,
  password: {
    type: String,
    required: true,
    select: false,
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
  updated_at: {
    type: Date,
    default: new Date(),
  },
})

export default model<UserModelInterface>('Users', UsersSchema)