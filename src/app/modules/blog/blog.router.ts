import express from "express";
import { blogController } from "./blog.controller";
import validateRequest from "../../middleware/validateRequest";
import { blogValidation } from "./blog.validation";
import auth from "../../middleware/auth";
import USER_ROLE from "../user/user.const";
const blogRouter = express.Router();

blogRouter.post(
  "/blogs",
  auth(USER_ROLE.superAdmin),
  validateRequest(blogValidation.blogValidationSchema),
  blogController.createBlog,
);

export default blogRouter;
