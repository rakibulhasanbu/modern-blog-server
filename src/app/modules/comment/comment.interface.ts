import { Schema, Document } from "mongoose";

export interface TComment extends Document {
  blog_author: Schema.Types.ObjectId;
  comment: string;
  children?: Schema.Types.ObjectId[];
  commented_by: Schema.Types.ObjectId;
  isReply?: boolean;
  parent?: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
