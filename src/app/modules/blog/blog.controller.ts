import { Request, Response } from "express";
import { blogService } from "./blog.services";
import { CatchAsyncError } from "../../utils/CatchAsyncError";

const createBlog = CatchAsyncError(async (req: Request, res: Response) => {
  const blog = req.body;
  blog.createdBy = req.user._id;

  const result = await blogService.createBlogIntoDB(blog);
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Blog created successfully",
    data: result,
  });
});

export const blogController = {
  createBlog,
};
