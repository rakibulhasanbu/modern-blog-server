import { Request, Response } from "express";
import { CatchAsyncError } from "../../../utils/CatchAsyncError";
import sendResponse from "../../../utils/sendResponse";
import { commentServices } from "./comment.service";

const createComment = CatchAsyncError(async (req: Request, res: Response) => {
  const result = await commentServices.createCommentIntoDB(req.user, req.body);

  sendResponse(res, {
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

  sendResponse(res, {
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
