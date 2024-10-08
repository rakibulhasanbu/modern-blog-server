import express from "express";
import { commentController } from "./comment.controller";
import validateRequest from "../../middleware/validateRequest";
import { commentValidation } from "./comment.validation";
import auth from "../../middleware/auth";

const commentRoute = express.Router();

commentRoute.post(
  "/comment",
  auth(),
  validateRequest(commentValidation.commentValidationSchema),
  commentController.createComment,
);

commentRoute.get("/comments/:blogId", commentController.getAllComment);

export default commentRoute;
