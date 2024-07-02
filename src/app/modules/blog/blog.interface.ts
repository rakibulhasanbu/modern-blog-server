import { Schema, Document } from "mongoose";

interface Activity {
  total_likes: number;
  total_comments: number;
  total_reads: number;
  total_parent_comments: number;
}

export interface TBlog extends Document {
  title: string;
  banner?: string;
  des?: string;
  content?: unknown[];
  tags?: string[];
  author: Schema.Types.ObjectId;
  activity: Activity;
  comments?: Schema.Types.ObjectId[];
  draft: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
