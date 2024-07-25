import express from "express";
import { blogController } from "./blog.controller";
import validateRequest from "../../middleware/validateRequest";
import { blogValidation } from "./blog.validation";
import auth from "../../middleware/auth";
const blogRouter = express.Router();

blogRouter.post(
  "/blog",
  auth(),
  validateRequest(blogValidation.blogValidationSchema),
  blogController.createBlog,
);

blogRouter.get("/blogs", blogController.getLatestBlog);

blogRouter.get("/my-blogs", auth(), blogController.getMyBlogs);

blogRouter.get("/trending-blogs", blogController.getTrendingBlog);

blogRouter.delete("/blog/:slug", auth(), blogController.deleteBlog);

export default blogRouter;
