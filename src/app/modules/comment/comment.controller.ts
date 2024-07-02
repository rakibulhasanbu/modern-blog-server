import { Request, Response } from "express";
import { CatchAsyncError } from "../../utils/CatchAsyncError";
import { commentServices } from "./comment.service";

const createComment = CatchAsyncError(async (req: Request, res: Response) => {
  const comment = req.body;
  comment.createdBy = req.user._id;

  const result = await commentServices.createCommentIntoDB(comment);
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Comment created successfully",
    data: result,
  });
});

const getAllComment = CatchAsyncError(async (req: Request, res: Response) => {
  const result = await commentServices.getAllCommentFromDB();
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Categories retrieved successfully",
    data: result,
  });
});

export const commentController = {
  createComment,
  getAllComment,
};
