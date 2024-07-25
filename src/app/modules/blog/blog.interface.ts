import { Schema, Document } from "mongoose";

interface Activity {
  totalLikes: number;
  totalComments: number;
  totalReads: number;
  totalParentComments: number;
}

export interface TBlog extends Document {
  slug: string;
  title: string;
  banner: string;
  description: string;
  content?: unknown[];
  tags: string[];
  author: Schema.Types.ObjectId;
  activity: Activity;
  comments?: Schema.Types.ObjectId[];
  draft: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
