import { Schema, model } from "mongoose";
import { TComment } from "./comment.interface";

const commentSchema = new Schema<TComment>(
  {
    blogId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Blog",
    },
    blogAuthor: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    comment: {
      type: String,
      required: true,
    },
    commentedBy: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
    children: {
      type: [Schema.Types.ObjectId],
      ref: "Comment",
    },
    isReply: {
      type: Boolean,
      default: false,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  },
  { timestamps: true },
);

const Comment = model("Comment", commentSchema);

export default Comment;
