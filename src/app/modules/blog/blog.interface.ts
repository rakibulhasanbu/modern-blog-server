import { Schema, Document } from "mongoose";

interface Activity {
  total_likes: number;
  total_comments: number;
  total_reads: number;
  total_parent_comments: number;
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

export interface TBlogQuery {
  draft: boolean;
  tags?: { $regex: unknown; $options: string };
  slug?: { $ne: string };
  author?: string;
}
