import { Schema, Document, ObjectId } from "mongoose";

export interface TComment extends Document {
  blogId: Schema.Types.ObjectId;
  blogAuthor: Schema.Types.ObjectId;
  comment: string;
  children?: Schema.Types.ObjectId[];
  commentedBy: Schema.Types.ObjectId;
  isReply?: boolean;
  parent?: Schema.Types.ObjectId;
  replyingTo?: ObjectId;
}

export interface TCommentObj {
  blogId: ObjectId;
  blogAuthor: ObjectId;
  comment: string;
  commentedBy: ObjectId;
  parent?: ObjectId;
  isReply?: boolean;
}
