import { Schema, Document } from "mongoose";

export interface TComment extends Document {
  blogSlug: Schema.Types.ObjectId;
  blog_author: Schema.Types.ObjectId;
  comment: string;
  children?: Schema.Types.ObjectId[];
  commented_by: Schema.Types.ObjectId;
  isReply?: boolean;
  parent?: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
