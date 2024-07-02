import { Request, Response } from "express";
import { blogService } from "./blog.services";
import { CatchAsyncError } from "../../utils/CatchAsyncError";
import { projectServices } from "../project/project.service";
import AppError from "../../error/AppError";

const createBlog = CatchAsyncError(async (req: Request, res: Response) => {
  const blog = req.body;
  blog.createdBy = req.user._id;

  const isProjectExist = await projectServices.getSingleProjectById(
    blog?.courseId,
  );
  if (!isProjectExist) {
    throw new AppError(404, "Project id not valid!");
  }

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
