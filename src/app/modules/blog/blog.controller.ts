import { Request, Response } from "express";
import { blogService } from "./blog.services";
import { CatchAsyncError } from "@utils/CatchAsyncError";
import sendResponse from "@utils/sendResponse";

const createBlog = CatchAsyncError(async (req: Request, res: Response) => {
  const result = await blogService.createBlogIntoDB(req.user, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Blog created successfully",
    data: result,
  });
});

const updateBlog = CatchAsyncError(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const result = await blogService.updateBlogBySlugIntoDB(
    req.user,
    req.body,
    slug,
  );

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Blog updated successfully",
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

const getBlogBySlug = CatchAsyncError(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const result = await blogService.getBlogsBySlugFromDB(slug, req.query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Blog retrieved successfully",
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

const likeBlog = CatchAsyncError(async (req: Request, res: Response) => {
  const result = await blogService.likeBlogsIntoDB(req.user, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Blog liked successful",
    data: result,
  });
});

const isLikeBlogByUser = CatchAsyncError(
  async (req: Request, res: Response) => {
    const result = await blogService.getIsLikedBlogByUserFromDB(
      req.user,
      req.query,
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "This Blog is liked",
      data: result,
    });
  },
);

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
  updateBlog,
  getLatestBlog,
  getMyBlogs,
  getTrendingBlog,
  deleteBlog,
  getBlogBySlug,
  likeBlog,
  isLikeBlogByUser,
};
