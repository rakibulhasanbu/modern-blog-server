import { Request, Response } from "express";
import { blogService } from "./blog.services";
import { CatchAsyncError } from "../../utils/CatchAsyncError";
import sendResponse from "../../utils/sendResponse";

const createBlog = CatchAsyncError(async (req: Request, res: Response) => {
  const result = await blogService.createBlogIntoDB(req.user, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Blog created successfully",
    data: result,
  });
});

const getLatestBlog = CatchAsyncError(async (req: Request, res: Response) => {
  const result = await blogService.getLatestBlogFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Latest blogs retrieved successfully",
    data: result,
  });
});

const getMyBlogs = CatchAsyncError(async (req: Request, res: Response) => {
  const result = await blogService.getMyBlogsFromDB(req.user, req.query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Owner blogs retrieved successfully",
    data: result,
  });
});

const getTrendingBlog = CatchAsyncError(async (req: Request, res: Response) => {
  const result = await blogService.getTrendingBlogFromDB();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Trending blogs retrieved successfully",
    data: result,
  });
});

const deleteBlog = CatchAsyncError(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const result = await blogService.deleteBlogBySlugIntoDB(req.user, slug);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Blog deleted successfully",
    data: result,
  });
});

export const blogController = {
  createBlog,
  getLatestBlog,
  getMyBlogs,
  getTrendingBlog,
  deleteBlog,
};
