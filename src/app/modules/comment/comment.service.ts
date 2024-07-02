import { TComment } from "./comment.interface";
import Comment from "./comment.model";

const createCommentIntoDB = async (comment: TComment) => {
  return await Comment.create(comment);
};

const getAllCommentFromDB = async () => {
  const result = await Comment.find().populate({
    path: "createdBy",
    select: "_id name email role",
  });
  return {
    categories: result,
  };
};

export const commentServices = {
  createCommentIntoDB,
  getAllCommentFromDB,
};
