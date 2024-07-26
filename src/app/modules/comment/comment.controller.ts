import { Request, Response } from "express";
import { CatchAsyncError } from "../../utils/CatchAsyncError";
import { commentServices } from "./comment.service";

const createComment = CatchAsyncError(async (req: Request, res: Response) => {
  const result = await commentServices.createCommentIntoDB(req.user, req.body);

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Comment created successfully",
    data: result,
  });
});

const getAllComment = CatchAsyncError(async (req: Request, res: Response) => {
  const { blogId } = req.params;

  const result = await commentServices.getAllCommentByBlogIdFromDB(
    blogId,
    req.query,
  );

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Comments retrieved successfully",
    data: result,
  });
});

export const commentController = {
  createComment,
  getAllComment,
};
