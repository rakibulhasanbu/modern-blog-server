import express from "express";
import { blogController } from "./blog.controller";
import validateRequest from "../../middleware/validateRequest";
import { blogValidation } from "./blog.validation";
import auth from "../../middleware/auth";
const blogRouter = express.Router();

blogRouter.post(
  "/blogs",
  auth(),
  validateRequest(blogValidation.blogValidationSchema),
  blogController.createBlog,
);

export default blogRouter;
